import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { requireUserId, applySearch, now, verifyTurnstile, requireActivePlatformDomain } from "./lib";
import { validateSubdomainLabel } from "./validators";


// Public check for availability
export const checkAvailability = query({
    args: {
        subdomain: v.string(),
        rootDomain: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const rootDomain = (args.rootDomain ?? "doofs.tech").toLowerCase();

        // Basic format check
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
        if (!subdomainRegex.test(args.subdomain)) {
            return { available: false, reason: "Invalid format" };
        }

        const pd = await ctx.db
            .query("platform_domains")
            .withIndex("by_domain", (q: any) => q.eq("domain", rootDomain))
            .first();

        // Return unavailable if root domain is closed, unless we want to be more specific
        if (!pd || !pd.isActive) return { available: false, reason: "Root domain unavailable" };

        const existing = await ctx.db
            .query("domains")
            .withIndex("by_full_domain", (q) => q.eq("rootDomain", rootDomain).eq("subdomain", args.subdomain))
            .first();

        if (existing) return { available: false };

        return { available: true };
    }
});

export const listMine = query({
    args: { search: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const items = await ctx.db
            .query("domains")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        return applySearch(items, args.search, ["subdomain", "rootDomain", "ownerEmail"]);
    },
});

export const claim = action({
    args: {
        subdomain: v.string(),
        rootDomain: v.optional(v.string()), // default doofs.tech
        token: v.string(),
    },
    handler: async (ctx, args): Promise<any> => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const isValid = await verifyTurnstile(args.token);
        if (!isValid) throw new Error("Turnstile validation failed. Please try again.");

        return await ctx.runMutation(internal.domainsInternal.claimInternal, {
            subdomain: args.subdomain,
            rootDomain: args.rootDomain ?? "doofs.tech",
            userId,
        }) as any;
    },
});

export const remove = action({
    args: { id: v.id("domains") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Get domain and records info first
        const domain = await ctx.runQuery(internal.domainsInternal.getDomainWithRecords, {
            domainId: args.id,
            userId,
        });

        if (!domain) throw new Error("Domain not found or not authorized");

        // Delete each record from Cloudflare
        const cfToken = process.env.CLOUDFLARE_API_TOKEN;
        if (cfToken && domain.zoneId) {
            for (const record of domain.records) {
                if (record.providerRecordId) {
                    try {
                        const resp = await fetch(
                            `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}/dns_records/${record.providerRecordId}`,
                            {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${cfToken}`,
                                    "Content-Type": "application/json",
                                },
                            }
                        );
                        const data = await resp.json();
                        if (!data.success) {
                            const isNotFound = data.errors?.some((e: any) => e.code === 81044 || e.code === 1001);
                            if (!isNotFound) {
                                console.warn(`Failed to delete CF record ${record.providerRecordId}:`, data.errors);
                            }
                        }
                    } catch (e) {
                        console.warn(`Error deleting CF record ${record.providerRecordId}:`, e);
                    }
                }
            }
        }

        // Now delete from database
        await ctx.runMutation(internal.domainsInternal.removeInternal, {
            domainId: args.id,
            userId,
        });
    },
});
// Helper for other internal modules to assert ownership (or admin access)
export async function assertDomainOwner(ctx: any, domainId: any) {
    const userId = await requireUserId(ctx);
    const domain = await ctx.db.get(domainId);
    if (!domain) throw new Error("Domain not found");

    if (domain.userId !== userId) {
        // Allow admins to bypass ownership check
        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") {
            throw new Error("Not authorized for this domain");
        }
    }
    return domain;
}
