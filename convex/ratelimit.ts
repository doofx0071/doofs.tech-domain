import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { getSettingsOrDefaults } from "./lib";

/**
 * Check and enforce DNS operations rate limit
 * Uses a sliding window approach with the rate_limits table
 */
export async function checkDnsOperationsRateLimit(ctx: any, userId: string) {
    const settings = await getSettingsOrDefaults(ctx);
    const limit = settings.maxDnsOperationsPerMinute;
    const windowMs = 60 * 1000; // 60 seconds
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create rate limit entry for this user
    const key = "dns_operations";
    const rateLimitEntry = await ctx.db
        .query("rate_limits")
        .withIndex("by_user_and_key", (q: any) => q.eq("userId", userId).eq("key", key))
        .first();

    if (!rateLimitEntry) {
        // First operation, create entry
        await ctx.db.insert("rate_limits", {
            userId,
            key,
            windowStart: now,
            count: 1,
            updatedAt: now,
        });
        return;
    }

    // Check if we're still in the same window
    if (rateLimitEntry.windowStart > windowStart) {
        // Still in the current window
        if (rateLimitEntry.count >= limit) {
            const resetIn = Math.ceil((rateLimitEntry.windowStart + windowMs - now) / 1000);
            throw new Error(
                `Rate limit exceeded. You can perform ${limit} DNS operations per minute. Please wait ${resetIn} seconds.`
            );
        }

        // Increment count
        await ctx.db.patch(rateLimitEntry._id, {
            count: rateLimitEntry.count + 1,
            updatedAt: now,
        });
    } else {
        // Window expired, start new window
        await ctx.db.patch(rateLimitEntry._id, {
            windowStart: now,
            count: 1,
            updatedAt: now,
        });
    }
}

/**
 * Generic rate limiter helper if needed for other things
 */
export async function checkRateLimit(ctx: any, userId: string, key: string, limit: number, windowMs: number = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    const rateLimitEntry = await ctx.db
        .query("rate_limits")
        .withIndex("by_user_and_key", (q: any) => q.eq("userId", userId).eq("key", key))
        .first();

    if (!rateLimitEntry) {
        await ctx.db.insert("rate_limits", {
            userId,
            key,
            windowStart: now,
            count: 1,
            updatedAt: now,
        });
        return;
    }

    if (rateLimitEntry.windowStart > windowStart) {
        if (rateLimitEntry.count >= limit) {
            const resetIn = Math.ceil((rateLimitEntry.windowStart + windowMs - now) / 1000);
            throw new Error(`Rate limit exceeded for ${key}. Please wait ${resetIn} seconds.`);
        }
        await ctx.db.patch(rateLimitEntry._id, {
            count: rateLimitEntry.count + 1,
            updatedAt: now,
        });
    } else {
        await ctx.db.patch(rateLimitEntry._id, {
            windowStart: now,
            count: 1,
            updatedAt: now,
        });
    }
}
