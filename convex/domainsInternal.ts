import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { requireActivePlatformDomain, now } from "./lib";
import { validateSubdomainLabel } from "./validators";

export const getDomainWithRecords = internalQuery({
    args: {
        domainId: v.id("domains"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const domain = await ctx.db.get(args.domainId);
        if (!domain) return null;
        if (domain.userId !== args.userId) return null;

        // Get platform domain for zone ID
        const platformDomain = await ctx.db
            .query("platform_domains")
            .withIndex("by_domain", (q) => q.eq("domain", domain.rootDomain))
            .first();

        // Get all DNS records
        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        return {
            ...domain,
            zoneId: platformDomain?.zoneId,
            records: records.map((r) => ({
                _id: r._id,
                providerRecordId: r.providerRecordId,
            })),
        };
    },
});


export const claimInternal = internalMutation({
    args: {
        subdomain: v.string(),
        rootDomain: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Enforce 5-domain limit
        const userDomains = await ctx.db
            .query("domains")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (userDomains.length >= 5) {
            throw new Error("You have reached the limit of 5 subdomains per user.");
        }

        const rootDomain = args.rootDomain.toLowerCase();
        const subdomain = validateSubdomainLabel(args.subdomain);

        await requireActivePlatformDomain(ctx, rootDomain);

        const existing = await ctx.db
            .query("domains")
            .withIndex("by_full_domain", (q) =>
                q.eq("rootDomain", rootDomain).eq("subdomain", subdomain)
            )
            .first();
        if (existing) throw new Error("Subdomain already taken on this root domain.");

        const domainId = await ctx.db.insert("domains", {
            subdomain,
            rootDomain,
            userId: args.userId,
            ownerEmail: undefined,
            status: "active",
            createdAt: now(),
            updatedAt: now(),
        });

        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "domain_claimed",
            details: `Claimed: ${subdomain}.${rootDomain}`,
            timestamp: now(),
            status: "success",
        });

        return domainId;
    },
});

export const removeInternal = internalMutation({
    args: {
        domainId: v.id("domains"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const domain = await ctx.db.get(args.domainId);
        if (!domain) throw new Error("Domain not found");
        if (domain.userId !== args.userId) throw new Error("Not authorized");

        // Delete all DNS records for this domain
        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        for (const record of records) {
            await ctx.db.delete(record._id);
        }

        // Delete any pending jobs
        const jobs = await ctx.db
            .query("dns_jobs")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        for (const job of jobs) {
            await ctx.db.delete(job._id);
        }

        // Delete the domain
        await ctx.db.delete(args.domainId);

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "domain_deleted",
            details: `Deleted: ${domain.subdomain}.${domain.rootDomain}`,
            timestamp: now(),
            status: "success",
        });
    },
});
