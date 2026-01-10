import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireUserId, now } from "./lib";
import { validateDnsName, validateRecordContent, computeFqdn } from "./validators";
import { assertDomainOwner } from "./domains";

export const listRecords = query({
    args: { domainId: v.id("domains") },
    handler: async (ctx, args) => {
        // Auth + Owner check
        await assertDomainOwner(ctx, args.domainId);

        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        return records;
    },
});

export const createRecord = mutation({
    args: {
        domainId: v.id("domains"),
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(), // relative
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const domain = await assertDomainOwner(ctx, args.domainId);

        // Validation
        const name = validateDnsName(args.name);
        const content = validateRecordContent(args.type, args.content);
        const fqdn = computeFqdn(name, domain.subdomain, domain.rootDomain);

        // Enforce Scope strictly
        const apex = `${domain.subdomain}.${domain.rootDomain}`;
        if (fqdn !== apex && !fqdn.endsWith(`.${apex}`)) {
            throw new Error("You can only manage records within your subdomain.");
        }

        // Check Rate Limits (Simple simplified version)
        // In strict impl, we would check rate_limits table

        // Use domain owner's ID for the record, so it shows up in their stats
        // If domain has no owner (platform), fall back to acting user
        const recordOwnerId = domain.userId ?? userId;

        const recordId = await ctx.db.insert("dns_records", {
            domainId: args.domainId,
            userId: recordOwnerId,
            rootDomain: domain.rootDomain,
            subdomain: domain.subdomain,
            type: args.type,
            name,
            fqdn,
            content,
            priority: args.priority,
            ttl: args.ttl,
            status: "pending",
            createdAt: now(),
            updatedAt: now(),
        });

        // Enqueue Job
        await ctx.scheduler.runAfter(0, internal.dnsJobs.processDue);
        await ctx.db.insert("dns_jobs", {
            jobType: "UPSERT_RECORD",
            domainId: args.domainId,
            recordId,
            status: "queued",
            attempts: 0,
            idempotencyKey: Math.random().toString(36).slice(2),
            createdAt: now(),
            updatedAt: now(),
        });

        return recordId;
    },
});

export const deleteRecord = mutation({
    args: { recordId: v.id("dns_records") },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const record = await ctx.db.get(args.recordId);
        if (!record) throw new Error("Record not found");

        if (record.userId !== userId) {
            // Allow admins
            const user = await ctx.db.get(userId);
            if (user?.role !== "admin") {
                throw new Error("Unauthorized");
            }
        }

        // Mark deleting
        await ctx.db.patch(args.recordId, { status: "deleting", updatedAt: now() });

        // Enqueue Job
        await ctx.scheduler.runAfter(0, internal.dnsJobs.processDue);
        await ctx.db.insert("dns_jobs", {
            jobType: "DELETE_RECORD",
            domainId: record.domainId,
            recordId: record._id,
            status: "queued",
            attempts: 0,
            idempotencyKey: Math.random().toString(36).slice(2),
            createdAt: now(),
            updatedAt: now(),
        });
    }
});

export const updateRecord = mutation({
    args: {
        recordId: v.id("dns_records"),
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(), // relative
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const record = await ctx.db.get(args.recordId);
        if (!record) throw new Error("Record not found");

        if (record.userId !== userId) {
            // Allow admins
            const user = await ctx.db.get(userId);
            if (user?.role !== "admin") {
                throw new Error("Unauthorized");
            }
        }

        const domain = await ctx.db.get(record.domainId);
        if (!domain) throw new Error("Domain not found");

        // Validation
        const name = validateDnsName(args.name);
        const content = validateRecordContent(args.type, args.content);
        const fqdn = computeFqdn(name, domain.subdomain, domain.rootDomain);

        // Enforce Scope strictly
        const apex = `${domain.subdomain}.${domain.rootDomain}`;
        if (fqdn !== apex && !fqdn.endsWith(`.${apex}`)) {
            throw new Error("You can only manage records within your subdomain.");
        }

        // Update DB
        await ctx.db.patch(args.recordId, {
            type: args.type,
            name,
            fqdn,
            content,
            priority: args.priority,
            ttl: args.ttl,
            status: "pending",
            updatedAt: now(),
            lastError: undefined, // Clear previous errors
        });

        // Enqueue Job (UPSERT handles updates too)
        await ctx.scheduler.runAfter(0, internal.dnsJobs.enqueueUpsert, {
            domainId: record.domainId,
            recordId: record._id,
        });
    },
});

export const getMyStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);

        const domains = await ctx.db
            .query("domains")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return {
            totalDomains: domains.length,
            activeDomains: domains.filter(d => d.status === "active").length,
            totalRecords: records.length,
            domainsLimit: 5 // Hardcoded limit for now
        };
    }
});

export const listAllMyRecords = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);
        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        return records;
    }
});
