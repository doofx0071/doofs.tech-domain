import { httpRouter } from "convex/server";
import { httpAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { auth } from "./auth";

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
    const storageId = process.env.LOGO_LIGHT_STORAGE_ID || "kg2f07w27gqfmhnat12h105hys7yt3a5";

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
    const storageId = process.env.LOGO_DARK_STORAGE_ID || "kg29w6s9t5cjwbh1cz82g1has97yvfhe";

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
