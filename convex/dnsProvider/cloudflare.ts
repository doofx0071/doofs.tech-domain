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
