import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireActivePlatformDomain, now, getSettingsOrDefaults } from "./lib";
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

export const getInternal = internalQuery({
    args: {
        domainId: v.id("domains"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const domain = await ctx.db.get(args.domainId);
        if (!domain) return null;
        if (domain.userId !== args.userId) return null;
        return domain;
    },
});

export const listByUserInternal = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const domains = await ctx.db
            .query("domains")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        return domains;
    },
});

export const claimInternal = internalMutation({
    args: {
        subdomain: v.string(),
        rootDomain: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Check if domain creation is allowed
        const settings = await getSettingsOrDefaults(ctx);
        if (!settings.allowDomainCreation) {
            throw new Error("Domain creation is currently disabled by the platform administrator.");
        }

        // Enforce domain limit from settings
        const userDomains = await ctx.db
            .query("domains")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (userDomains.length >= settings.maxDomainsPerUser) {
            throw new Error(`You have reached the limit of ${settings.maxDomainsPerUser} subdomains per user.`);
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
            status: "pending_verification",
            verificationCode: `doofs-verify=${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
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

        const domain = await ctx.db.get(domainId);
        return { domainId, verificationCode: domain?.verificationCode };
    },
});

// Activate domain after successful verification
export const activateDomain = internalMutation({
    args: { domainId: v.id("domains") },
    handler: async (ctx, args) => {
        const domain = await ctx.db.get(args.domainId);
        if (!domain) throw new Error("Domain not found");

        await ctx.db.patch(args.domainId, {
            status: "active",
            verifiedAt: now(),
            updatedAt: now(),
        });

        // Audit log
        if (domain.userId) {
            await ctx.db.insert("auditLogs", {
                userId: domain.userId,
                action: "domain_verified",
                details: `Verified: ${domain.subdomain}.${domain.rootDomain}`,
                timestamp: now(),
                status: "success",
            });
        }
    },
});

// Update SSL status for a domain
export const updateSSLStatus = internalMutation({
    args: {
        domainId: v.id("domains"),
        sslStatus: v.union(
            v.literal("active"),
            v.literal("pending"),
            v.literal("initializing"),
            v.literal("none")
        ),
    },
    handler: async (ctx, args) => {
        const domain = await ctx.db.get(args.domainId);

        await ctx.db.patch(args.domainId, {
            sslStatus: args.sslStatus,
            sslCheckedAt: now(),
            updatedAt: now(),
        });

        // Audit log (use domain owner as actor for system-initiated SSL updates)
        if (domain?.userId) {
            await ctx.db.insert("auditLogs", {
                userId: domain.userId,
                action: "domain_ssl_updated",
                details: `SSL status updated to "${args.sslStatus}" for ${domain.subdomain}.${domain.rootDomain}`,
                timestamp: now(),
                status: "success",
            });
        }
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

        // Delete all pending/expired transfers for this domain
        const transfers = await ctx.db
            .query("domain_transfers")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        for (const t of transfers) {
            await ctx.db.delete(t._id);
        }

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

// Internal action that handles Cloudflare cleanup before database deletion
// Used by HTTP API to ensure DNS records are properly removed from Cloudflare
export const removeWithCloudflare = internalAction({
    args: {
        domainId: v.id("domains"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // 1. Get domain with records
        const domain = await ctx.runQuery(internal.domainsInternal.getDomainWithRecords, {
            domainId: args.domainId,
            userId: args.userId,
        });
        if (!domain) throw new Error("Domain not found or not authorized");

        // 2. Delete each record from Cloudflare
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

        // 3. Delete from database (this also creates audit log)
        await ctx.runMutation(internal.domainsInternal.removeInternal, {
            domainId: args.domainId,
            userId: args.userId,
        });
    },
});
