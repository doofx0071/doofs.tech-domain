"use node";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";

function getEnv(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
}

export const upsertRecord = internalAction({
    args: {
        zoneId: v.optional(v.string()), // Optional override, otherwise use env
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(), // FQDN
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
        providerRecordId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const token = getEnv("CLOUDFLARE_API_TOKEN");
        const defaultZoneId = getEnv("CLOUDFLARE_ZONE_ID");
        const zoneId = args.zoneId || defaultZoneId;

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };


        // If we have a record ID, try to update it first
        if (args.providerRecordId) {
            // Build request body - only include priority for record types that need it
            const requestBody: any = {
                type: args.type,
                name: args.name,
                content: args.content,
                ttl: args.ttl || 1, // 1 = automatic
            };

            // Only include priority for MX, SRV, URI records (or if explicitly provided)
            if (args.priority !== undefined) {
                requestBody.priority = args.priority;
            }

            const resp = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${args.providerRecordId}`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await resp.json();
            if (data.success) {
                return { id: data.result.id, success: true };
            }

            // If record not found (deleted externally?), fall through to create
            // For other errors, throw
            const isNotFound = data.errors?.some((e: any) => e.code === 81044 || e.code === 1001);
            if (!isNotFound) {
                throw new Error(`Cloudflare update failed: ${JSON.stringify(data.errors)}`);
            }
        }

        // Creating new record (or re-creating lost one)
        // First, check if one already exists to avoid dupes (idempotency)
        const listResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${args.name}&type=${args.type}`,
            { headers }
        );
        const listData = await listResp.json();

        // If exact match exists, update it instead of creating duplicate
        const existing = listData.result?.find((r: any) => r.name === args.name && r.type === args.type);

        if (existing) {
            const requestBody: any = {
                type: args.type,
                name: args.name,
                content: args.content,
                ttl: args.ttl || 1,
            };

            if (args.priority !== undefined) {
                requestBody.priority = args.priority;
            }

            const resp = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(requestBody),
                }
            );
            const data = await resp.json();
            if (!data.success) throw new Error(`Cloudflare update existing failed: ${JSON.stringify(data.errors)}`);
            return { id: data.result.id, success: true };
        }

        // Truly create new
        const createBody: any = {
            type: args.type,
            name: args.name,
            content: args.content,
            ttl: args.ttl || 1,
        };

        if (args.priority !== undefined) {
            createBody.priority = args.priority;
        }

        const createResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
            {
                method: "POST",
                headers,
                body: JSON.stringify(createBody),
            }
        );

        const createData = await createResp.json();
        if (!createData.success) {
            throw new Error(`Cloudflare create failed: ${JSON.stringify(createData.errors)}`);
        }

        return { id: createData.result.id, success: true };
    },
});

export const deleteRecord = internalAction({
    args: {
        zoneId: v.optional(v.string()),
        providerRecordId: v.string(),
    },
    handler: async (ctx, args) => {
        const token = getEnv("CLOUDFLARE_API_TOKEN");
        const defaultZoneId = getEnv("CLOUDFLARE_ZONE_ID");
        const zoneId = args.zoneId || defaultZoneId;

        const resp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${args.providerRecordId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await resp.json();
        // Verify success or "not found" (which means already deleted)
        if (!data.success) {
            const isNotFound = data.errors?.some((e: any) => e.code === 81044 || e.code === 1001);
            if (!isNotFound) throw new Error(`Cloudflare delete failed: ${JSON.stringify(data.errors)}`);
        }

        return { success: true };
    },
});

export const createZone = internalAction({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const token = getEnv("CLOUDFLARE_API_TOKEN");
        // We don't need zone ID to create a zone, just token with permissions

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        // 1. Check if exists first
        const listResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones?name=${args.name}`,
            { headers }
        );
        const listData = await listResp.json();

        if (listData.result && listData.result.length > 0) {
            const zone = listData.result[0];
            return {
                zoneId: zone.id,
                nameservers: zone.name_servers,
                status: zone.status,
                existed: true
            };
        }

        // 2. Create if not exists
        // Note: Free plan is 'type: full' usually.
        // API requires account.id. Use env var if available (to avoid needing Account:Read permission)
        let accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

        if (!accountId) {
            // Fallback to fetching if env var not set (requires Account:Read permission)
            const accountResp = await fetch(`https://api.cloudflare.com/client/v4/accounts`, { headers });
            const accountData = await accountResp.json();
            accountId = accountData.result?.[0]?.id;
        }

        if (!accountId) throw new Error("Could not find Cloudflare account ID. Please set CLOUDFLARE_ACCOUNT_ID env var.");

        const createResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    name: args.name,
                    account: { id: accountId },
                    type: "full" // Standard full setup
                }),
            }
        );
        const createData = await createResp.json();

        if (!createData.success) {
            throw new Error(`Cloudflare create zone failed: ${JSON.stringify(createData.errors)}`);
        }

        const zone = createData.result;
        return {
            zoneId: zone.id,
            nameservers: zone.name_servers,
            status: zone.status,
            existed: false
        };
    }
});

export const getZone = internalAction({
    args: { zoneId: v.string() },
    handler: async (ctx, args) => {
        const token = getEnv("CLOUDFLARE_API_TOKEN");
        const resp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${args.zoneId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await resp.json();
        if (!data.success) throw new Error("Failed to fetch zone details");

        return {
            nameservers: data.result.name_servers,
            status: data.result.status
        };
    }
});

// List all DNS records from Cloudflare for a zone
export const listRecords = internalAction({
    args: { zoneId: v.string() },
    handler: async (ctx, args) => {
        const token = getEnv("CLOUDFLARE_API_TOKEN");

        // Fetch all records with pagination
        let allRecords: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const resp = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${args.zoneId}/dns_records?page=${page}&per_page=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await resp.json();

            if (!data.success) {
                throw new Error(data.errors?.[0]?.message || "Failed to fetch DNS records");
            }

            allRecords = allRecords.concat(data.result);

            // Check if there are more pages
            const totalPages = data.result_info?.total_pages || 1;
            hasMore = page < totalPages;
            page++;
        }

        // Map to consistent format
        return allRecords.map((record: any) => ({
            id: record.id,
            type: record.type,
            name: record.name,
            content: record.content,
            priority: record.priority,
            ttl: record.ttl,
            proxied: record.proxied,
            createdOn: record.created_on,
            modifiedOn: record.modified_on,
        }));
    }
});

// Lookup TXT records using Cloudflare DNS-over-HTTPS (for domain verification)
export const lookupTXTRecord = internalAction({
    args: { hostname: v.string() },
    handler: async (ctx, args) => {
        try {
            const response = await fetch(
                `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(args.hostname)}&type=TXT`,
                {
                    headers: {
                        "Accept": "application/dns-json",
                    },
                }
            );

            if (!response.ok) {
                return { found: false, records: [], error: "DNS query failed" };
            }

            const data = await response.json();

            // Extract TXT records from answer section
            const txtRecords: string[] = [];
            if (data.Answer) {
                for (const answer of data.Answer) {
                    if (answer.type === 16) { // TXT record type
                        // Remove surrounding quotes from TXT record data
                        const txtData = answer.data?.replace(/^"|"$/g, "") || "";
                        txtRecords.push(txtData);
                    }
                }
            }

            return {
                found: txtRecords.length > 0,
                records: txtRecords,
                error: null
            };
        } catch (e: any) {
            return {
                found: false,
                records: [],
                error: e.message || "DNS lookup failed"
            };
        }
    }
});

// Check SSL certificate status for a zone using Certificate Packs API
export const getSSLStatus = internalAction({
    args: { zoneId: v.string() },
    handler: async (ctx, args) => {
        const token = getEnv("CLOUDFLARE_API_TOKEN");

        try {
            console.log("[getSSLStatus] Checking SSL for zone:", args.zoneId);
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${args.zoneId}/ssl/certificate_packs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            console.log("[getSSLStatus] API Response success:", data.success);
            console.log("[getSSLStatus] Result count:", data.result?.length || 0);

            if (!data.success) {
                console.error("[getSSLStatus] API Error:", data.errors);
                return {
                    status: "none" as const,
                    expiresAt: null,
                    error: data.errors?.[0]?.message || "Failed to check SSL status"
                };
            }

            // Find Universal SSL or first active certificate pack
            const packs = data.result || [];
            console.log("[getSSLStatus] Certificate packs:", packs.map((p: any) => ({ type: p.type, status: p.status })));

            const universalPack = packs.find((p: any) => p.type === "universal");
            const activePack = packs.find((p: any) => p.status === "active") || universalPack;

            console.log("[getSSLStatus] Universal pack found:", !!universalPack);
            console.log("[getSSLStatus] Active pack found:", !!activePack);
            console.log("[getSSLStatus] Active pack status:", activePack?.status);

            if (activePack && activePack.status === "active") {
                const expiresOn = activePack.certificates?.[0]?.expires_on;
                console.log("[getSSLStatus] SSL is ACTIVE, expires:", expiresOn);
                return {
                    status: "active" as const,
                    expiresAt: expiresOn ? new Date(expiresOn).getTime() : null,
                    error: null
                };
            } else if (activePack && activePack.status === "pending_validation") {
                console.log("[getSSLStatus] SSL is PENDING_VALIDATION");
                return { status: "pending_validation" as const, expiresAt: null, error: null };
            } else if (packs.length > 0) {
                console.log("[getSSLStatus] SSL is INITIALIZING");
                return { status: "initializing" as const, expiresAt: null, error: null };
            }

            console.log("[getSSLStatus] No SSL packs found, returning NONE");
            return { status: "none" as const, expiresAt: null, error: null };
        } catch (e: any) {
            console.error("[getSSLStatus] Exception:", e);
            return { status: "none" as const, expiresAt: null, error: e.message || "SSL check failed" };
        }
    }
});


