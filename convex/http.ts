import { httpRouter } from "convex/server";
import { httpAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";
import { hashKey } from "./apiKeys";

const http = httpRouter();

auth.addHttpRoutes(http);

// Mailgun Webhook Handler
http.route({
  path: "/mailgun/message",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signatureKey = process.env.MAILGUN_SIGNING_KEY;
    if (!signatureKey) {
      console.error("Missing MAILGUN_SIGNING_KEY");
      return new Response("Configuration Error", { status: 500 });
    }

    try {
      const formData = await request.formData();
      const timestamp = formData.get("timestamp") as string;
      const token = formData.get("token") as string;
      const signature = formData.get("signature") as string;

      // Verify Signature logic
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(signatureKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      const data = encoder.encode(timestamp + token);
      const signatureBytes = hexToBytes(signature);

      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes as unknown as ArrayBuffer, // Cast to satisfy TS BufferSource
        data
      );

      if (!isValid) {
        return new Response("Invalid Signature", { status: 401 });
      }

      // Extract content
      const from = formData.get("from") as string || "Unknown";
      const subject = formData.get("subject") as string || "No Subject";
      const text = (formData.get("body-plain") as string) || (formData.get("body-html") as string) || "";

      // Attempt to parse name/email from "Name <email@example.com>"
      const nameMatch = from.match(/(.*)<(.*)>/);
      const name = nameMatch ? nameMatch[1].trim().replace(/^"|"$/g, '') : from;
      const email = nameMatch ? nameMatch[2].trim() : from;

      // Save to DB via internal mutation
      await ctx.runMutation(internal.http.saveMessage, {
        name,
        email,
        subject,
        message: text,
      });

      return new Response("OK", { status: 200 });

    } catch (e) {
      console.error("Webhook processing failed:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Serve light mode logo with stable URL
http.route({
  path: "/logo-light",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const storageId = process.env.LOGO_LIGHT_STORAGE_ID;

    if (!storageId) {
      console.warn("LOGO_LIGHT_STORAGE_ID environment variable not configured");
      return new Response("Logo not configured", { status: 503 });
    }

    const blob = await ctx.storage.get(storageId as any);

    if (!blob) {
      return new Response("Logo not found", { status: 404 });
    }

    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }),
});

// Serve dark mode logo with stable URL
http.route({
  path: "/logo-dark",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const storageId = process.env.LOGO_DARK_STORAGE_ID;

    if (!storageId) {
      console.warn("LOGO_DARK_STORAGE_ID environment variable not configured");
      return new Response("Logo not configured", { status: 503 });
    }

    const blob = await ctx.storage.get(storageId as any);

    if (!blob) {
      return new Response("Logo not found", { status: 404 });
    }

    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }),
});

// ==========================================
// PUBLIC API (v1)
// ==========================================

// API Middleware Helper
async function authenticateApi(ctx: any, request: Request) {
  const start = Date.now();
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401, start };
  }

  const apiKey = authHeader.split(" ")[1];
  const keyHash = await hashKey(apiKey);

  const key = await ctx.runQuery(internal.apiKeys.validateKey, { keyHash });

  if (!key) {
    return { error: "Invalid API Key", status: 403, start };
  }

  // Enforce Rate Limit (Blocking)
  try {
    await ctx.runMutation(internal.apiKeys.updateUsage, {
      keyId: key._id,
      userId: key.userId
    });
  } catch (e: any) {
    if (e.message.includes("Rate limit exceeded")) {
      return { error: "Rate limit exceeded. Please try again later.", status: 429, start };
    }
    // Log other errors but maybe don't block? Or block for safety?
    console.error("Rate limit check failed", e);
    return { error: "Internal Server Error", status: 500, start };
  }

  return { key, start };
}

// Helper to log request
async function logApi(ctx: any, result: any, request: Request, start: number) {
  const durationMs = Date.now() - start;
  const endpoint = new URL(request.url).pathname;
  const method = request.method;
  const status = result.status || 200;

  // 1. Log to Usage Stats (High volume, lightweight)
  await ctx.runMutation(internal.apiKeys.logRequest, {
    keyId: result.key?._id,
    userId: result.key?.userId,
    endpoint,
    method,
    status,
    ipAddress: request.headers.get("x-forwarded-for") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    durationMs,
  });

  // 2. Log to Audit Logs (User Action History)
  // Only log if we have a user (authenticated request)
  if (result.key?.userId) {
    const actionMap: Record<string, string> = {
      "GET /api/v1/domains": "api_list_domains",
      "POST /api/v1/domains": "api_create_domain",
    };

    // Construct simplified action name e.g. "api_get_domains"
    // Heuristic: Method + Resource
    let action = `api_${method.toLowerCase()}`;
    if (endpoint.includes("/dns")) action += "_dns";
    else if (endpoint.includes("/domains")) action += "_domains";

    await ctx.runMutation(internal.auditLogs.createAuditLog, {
      userId: result.key.userId,
      action: action,
      details: `${method} ${endpoint} (${status})`,
      status: status >= 400 ? "failed" : "success",
      metadata: {
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      }
    });
  }
}

// GET /api/v1/domains - List domains
http.route({
  path: "/api/v1/domains",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateApi(ctx, request);
    if (auth.error) {
      await logApi(ctx, { status: auth.status }, request, auth.start);
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { "Content-Type": "application/json" } });
    }

    const { key, start } = auth;
    const userDomains = await ctx.runQuery(internal.domainsInternal.listByUserInternal, { userId: key.userId });

    const response = new Response(JSON.stringify({
      data: userDomains
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

    await logApi(ctx, { key, status: 200 }, request, start);
    return response;
  }),
});

// POST /api/v1/domains - Create Domain
http.route({
  path: "/api/v1/domains",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateApi(ctx, request);
    if (auth.error) {
      await logApi(ctx, { status: auth.status }, request, auth.start);
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { "Content-Type": "application/json" } });
    }

    const { key, start } = auth;

    try {
      const body = await request.json();
      if (!body.subdomain) {
        throw new Error("Missing subdomain");
      }

      const result = await ctx.runMutation(internal.domainsInternal.claimInternal, {
        subdomain: body.subdomain,
        rootDomain: "doofs.tech",
        userId: key.userId
      });

      const response = new Response(JSON.stringify({ success: true, domain: result }), { status: 201, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 201 }, request, start);
      return response;

    } catch (e: any) {
      const status = 400;
      const response = new Response(JSON.stringify({ error: e.message }), { status, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status }, request, start);
      return response;
    }
  }),
});

// GET /api/v1/domains/:id - Get Single Domain
http.route({
  pathPrefix: "/api/v1/domains/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateApi(ctx, request);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { "Content-Type": "application/json" } });
    }
    const { key, start } = auth;

    // Use path splitting which is more reliable with pathPrefix on different environments
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(p => p.length > 0);
    // e.g. ["api", "v1", "domains", "ID"] or ...

    // Find index of "domains"
    const domainsIndex = pathParts.indexOf("domains");
    if (domainsIndex === -1 || pathParts.length <= domainsIndex + 1) {
      return new Response("Invalid URL structure", { status: 400 });
    }

    const domainIdStr = pathParts[domainsIndex + 1];

    // Check for DNS sub-route
    // if path is /domains/ID/dns...
    const isDnsRoute = pathParts.length > domainsIndex + 2 && pathParts[domainsIndex + 2] === "dns";

    // Reconstruct valid ID
    let domainId;
    try {
      // @ts-ignore
      domainId = new ctx.constructor.ID("domains", domainIdStr);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid Domain ID format" }), { status: 400 });
    }

    if (isDnsRoute) {
      return handleDnsRoutes(ctx, request, key, domainId, pathParts, domainsIndex);
    }

    if (request.method === "GET") {
      const domain = await ctx.runQuery(internal.domainsInternal.getInternal, {
        domainId: domainId as any,
        userId: key.userId
      });

      if (!domain) {
        const resp = new Response(JSON.stringify({ error: "Domain not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        await logApi(ctx, { key, status: 404 }, request, start);
        return resp;
      }

      const resp = new Response(JSON.stringify({ data: domain }), { status: 200, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 200 }, request, start);
      return resp;
    }

    return new Response("Method not allowed", { status: 405 });
  }),
});

// DELETE /api/v1/domains/:id - Delete Single Domain
http.route({
  pathPrefix: "/api/v1/domains/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateApi(ctx, request);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { "Content-Type": "application/json" } });
    }
    const { key, start } = auth;

    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(p => p.length > 0);
    const domainsIndex = pathParts.indexOf("domains");
    const domainIdStr = pathParts[domainsIndex + 1];
    const isDnsRoute = pathParts.length > domainsIndex + 2 && pathParts[domainsIndex + 2] === "dns";

    let domainId;
    try { // @ts-ignore
      domainId = new ctx.constructor.ID("domains", domainIdStr);
    } catch (e) { return new Response(JSON.stringify({ error: "Invalid Domain ID" }), { status: 400 }); }

    if (isDnsRoute) {
      return handleDnsRoutes(ctx, request, key, domainId, pathParts, domainsIndex);
    }

    try {
      await ctx.runMutation(internal.domainsInternal.removeInternal, {
        domainId: domainId as any,
        userId: key.userId
      });
      const resp = new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 200 }, request, start);
      return resp;
    } catch (e: any) {
      const resp = new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 400 }, request, start);
      return resp;
    }
  })
});

http.route({
  pathPrefix: "/api/v1/domains/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    return dispatchDns(ctx, request);
  })
});

http.route({
  pathPrefix: "/api/v1/domains/",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    return dispatchDns(ctx, request);
  })
});

async function dispatchDns(ctx: any, request: Request) {
  const auth = await authenticateApi(ctx, request);
  if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { "Content-Type": "application/json" } });

  const { key, start } = auth;
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(p => p.length > 0);
  const domainsIndex = pathParts.indexOf("domains");
  if (domainsIndex === -1) return new Response("Error", { status: 400 });
  const domainIdStr = pathParts[domainsIndex + 1];

  let domainId;
  try { // @ts-ignore
    domainId = new ctx.constructor.ID("domains", domainIdStr);
  } catch (e) { return new Response(JSON.stringify({ error: "Invalid Domain ID" }), { status: 400 }); }

  return handleDnsRoutes(ctx, request, key, domainId, pathParts, domainsIndex);
}

async function handleDnsRoutes(ctx: any, request: Request, key: any, domainId: any, pathParts: string[], domainsIndex: number) {
  const start = Date.now();

  if (pathParts[domainsIndex + 2] !== "dns") {
    return new Response("Not found", { status: 404 });
  }

  const recordIdStr = pathParts[domainsIndex + 3];

  if (request.method === "GET" && !recordIdStr) {
    const records = await ctx.runQuery(internal.dnsInternal.listRecordsInternal, {
      domainId: domainId,
      userId: key.userId
    });
    const resp = new Response(JSON.stringify({ data: records }), { status: 200, headers: { "Content-Type": "application/json" } });
    await logApi(ctx, { key, status: 200 }, request, start);
    return resp;
  }

  if (request.method === "POST" && !recordIdStr) {
    try {
      const body = await request.json();
      const recordId = await ctx.runMutation(internal.dnsInternal.createRecordInternal, {
        domainId: domainId,
        userId: key.userId,
        type: body.type,
        name: body.name,
        content: body.content,
        priority: body.priority,
        ttl: body.ttl
      });
      const resp = new Response(JSON.stringify({ success: true, id: recordId }), { status: 201, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 201 }, request, start);
      return resp;
    } catch (e: any) {
      const resp = new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 400 }, request, start);
      return resp;
    }
  }

  if (request.method === "PUT" && recordIdStr) {
    try {
      const body = await request.json();
      await ctx.runMutation(internal.dnsInternal.updateRecordInternal, {
        recordId: recordIdStr as any,
        userId: key.userId,
        type: body.type,
        name: body.name,
        content: body.content,
        priority: body.priority,
        ttl: body.ttl
      });
      const resp = new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 200 }, request, start);
      return resp;
    } catch (e: any) {
      const resp = new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 400 }, request, start);
      return resp;
    }
  }

  if (request.method === "DELETE" && recordIdStr) {
    try {
      await ctx.runMutation(internal.dnsInternal.deleteRecordInternal, {
        recordId: recordIdStr as any,
        userId: key.userId,
      });
      const resp = new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 200 }, request, start);
      return resp;
    } catch (e: any) {
      const resp = new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { "Content-Type": "application/json" } });
      await logApi(ctx, { key, status: 400 }, request, start);
      return resp;
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

// Internal mutation to save the message
export const saveMessage = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      status: "unread",
      createdAt: Date.now(),
    });
  },
});

export default http;
