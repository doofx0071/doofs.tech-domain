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

/**
 * Rate limiter for unauthenticated requests (e.g., contact form)
 * Uses email as identifier since we don't have userId
 * Limits: 3 submissions per 5 minutes per email address
 */
export async function checkContactFormRateLimit(ctx: any, email: string) {
    const limit = 3; // Max 3 submissions per window
    const windowMs = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Normalize email to prevent bypassing with variations
    const normalizedEmail = email.toLowerCase().trim();
    const key = `contact_form:${normalizedEmail}`;

    // Look for existing rate limit entry by key
    const rateLimitEntries = await ctx.db
        .query("rate_limits")
        .filter((q: any) => q.eq(q.field("key"), key))
        .collect();
    
    const rateLimitEntry = rateLimitEntries[0];

    if (!rateLimitEntry) {
        await ctx.db.insert("rate_limits", {
            userId: undefined, // No user ID for anonymous submissions
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
            throw new Error(`Too many contact submissions. Please wait ${Math.ceil(resetIn / 60)} minutes before trying again.`);
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
