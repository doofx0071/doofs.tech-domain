import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireUserId, requireAdmin, getSettingsOrDefaults } from "./lib";

// Generate a secure random string
function generateRandomKey(length: number = 32): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
}

// Compute SHA-256 hash
export async function hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const generate = mutation({
    args: {
        name: v.string(),
        scopes: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);

        const rawKeyPart = generateRandomKey(32);
        const prefix = "doofs_live_";
        const apiKey = `${prefix}${rawKeyPart}`;

        // Store only the hash
        const keyHash = await hashKey(apiKey);

        await ctx.db.insert("api_keys", {
            userId: userId,
            name: args.name,
            keyHash,
            prefix: apiKey.substring(0, 11) + "...", // Store prefix for identification (doofs_live_...)
            scopes: args.scopes,
            createdAt: Date.now(),
            status: "active",
        });

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: userId,
            action: "api_key_created",
            details: `Created API Key: ${args.name} (${apiKey.substring(0, 11)}...)`,
            timestamp: Date.now(),
            status: "success",
        });

        // Return the raw key ONLY ONCE
        return apiKey;
    },
});

export const revoke = mutation({
    args: {
        id: v.id("api_keys"),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const key = await ctx.db.get(args.id);

        if (!key || key.userId !== userId) {
            throw new Error("Key not found or unauthorized");
        }

        await ctx.db.patch(args.id, {
            status: "revoked",
        });

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: userId,
            action: "api_key_revoked",
            details: `Revoked API Key: ${key.name}`,
            timestamp: Date.now(),
            status: "success",
        });
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);

        const keys = await ctx.db
            .query("api_keys")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        return keys.map((k) => ({
            _id: k._id,
            name: k.name,
            prefix: k.prefix,
            createdAt: k.createdAt,
            lastUsedAt: k.lastUsedAt,
            scopes: k.scopes,
        }));
    },
});

export const getMyUsage = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);
        const settings = await getSettingsOrDefaults(ctx);
        const limit = settings.maxApiRequestsPerMinute;

        const now = Date.now();
        const startOfDay = now - 24 * 60 * 60 * 1000;

        // Fetch requests from last 24 hours
        // Note: For high scale, this should be pre-aggregated or paginated.
        const recentRequests = await ctx.db
            .query("api_requests")
            .withIndex("by_user_timestamp", (q) =>
                q.eq("userId", userId).gt("timestamp", startOfDay)
            )
            .collect();

        // Calculate basic stats
        const count24h = recentRequests.length;

        // Group by hour for a simple chart if needed, or just return total for now
        // Let's return the simplified timeline for the chart
        const timeline = new Array(24).fill(0);
        recentRequests.forEach(r => {
            const hourDiff = Math.floor((now - r.timestamp) / (60 * 60 * 1000));
            if (hourDiff >= 0 && hourDiff < 24) {
                timeline[23 - hourDiff]++; // 0 is 23h ago, 23 is now
            }
        });

        return {
            limit,
            count24h,
            timeline, // Array of counts per hour for the last 24h
            recentLogs: recentRequests.slice(0, 10).map(r => ({
                endpoint: r.endpoint,
                method: r.method,
                status: r.status,
                timestamp: r.timestamp,
                durationMs: r.durationMs
            }))
        };
    }
});

export const getGlobalUsage = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const now = Date.now();
        const startOfDay = now - 24 * 60 * 60 * 1000;

        // Get all requests in last 24h
        // Warning: Heavy query if traffic is high.
        const allRequests = await ctx.db
            .query("api_requests")
            .withIndex("by_timestamp", (q) => q.gt("timestamp", startOfDay))
            .collect();

        const total24h = allRequests.length;

        // Aggregate by user
        const userUsage: Record<string, number> = {};
        allRequests.forEach(r => {
            if (r.userId) {
                userUsage[r.userId] = (userUsage[r.userId] || 0) + 1;
            }
        });

        // Map to array with user details
        const userStats = [];
        for (const [uid, count] of Object.entries(userUsage)) {
            const user = await ctx.db.get(uid as Id<"users">);
            if (user) {
                const u = user as any;
                if (u.email) {
                    userStats.push({
                        userId: uid,
                        email: u.email,
                        name: u.name,
                        image: u.image,
                        count
                    });
                }
            }
        }

        return {
            total24h,
            userStats: userStats.sort((a, b) => b.count - a.count)
        };
    }
});

/*
 * Internal helpers for HTTP API
 */

export const validateKey = internalQuery({
    args: {
        keyHash: v.string(),
    },
    handler: async (ctx, args) => {
        const key = await ctx.db
            .query("api_keys")
            .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
            .first();

        if (!key || key.status !== "active") {
            return null;
        }

        return key;
    },
});

export const updateUsage = internalMutation({
    args: {
        keyId: v.id("api_keys"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.keyId, {
            lastUsedAt: Date.now(),
        });
    },
});

export const logRequest = internalMutation({
    args: {
        keyId: v.optional(v.id("api_keys")),
        userId: v.optional(v.id("users")),
        endpoint: v.string(),
        method: v.string(),
        status: v.number(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        durationMs: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("api_requests", {
            keyId: args.keyId,
            userId: args.userId,
            endpoint: args.endpoint,
            method: args.method,
            status: args.status,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            durationMs: args.durationMs,
            timestamp: Date.now(),
        });
    },
});
