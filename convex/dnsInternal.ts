import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { now, checkDnsRecordLimit } from "./lib";
import { checkDnsOperationsRateLimit } from "./ratelimit";
import { validateDnsName, validateRecordContent, computeFqdn } from "./validators";

// Helper to assert domain ownership internally
async function assertDomainOwnerInternal(ctx: any, domainId: any, userId: any) {
    const domain = await ctx.db.get(domainId);
    if (!domain) throw new Error("Domain not found");
    if (domain.userId !== userId) throw new Error("Unauthorized: Domain does not belong to this user");
    return domain;
}

export const listRecordsInternal = internalQuery({
    args: {
        domainId: v.id("domains"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Auth + Owner check
        await assertDomainOwnerInternal(ctx, args.domainId, args.userId);

        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        return records;
    },
});

export const createRecordInternal = internalMutation({
    args: {
        domainId: v.id("domains"),
        userId: v.id("users"),
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(), // relative
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const domain = await assertDomainOwnerInternal(ctx, args.domainId, args.userId);
        const userId = args.userId;

        // Check rate limit for DNS operations
        await checkDnsOperationsRateLimit(ctx, userId);

        // Check DNS record limit for this domain
        await checkDnsRecordLimit(ctx, args.domainId);

        // Validation
        const name = validateDnsName(args.name);
        const content = validateRecordContent(args.type, args.content);
        const fqdn = computeFqdn(name, domain.subdomain, domain.rootDomain);

        // Enforce Scope strictly
        const apex = `${domain.subdomain}.${domain.rootDomain}`;
        if (fqdn !== apex && !fqdn.endsWith(`.${apex}`)) {
            throw new Error("You can only manage records within your subdomain.");
        }

        // Default priority for MX records
        let priority = args.priority;
        if (args.type === "MX" && !priority) {
            priority = 10;
        }

        const recordId = await ctx.db.insert("dns_records", {
            domainId: args.domainId,
            userId: userId,
            rootDomain: domain.rootDomain,
            subdomain: domain.subdomain,
            type: args.type,
            name,
            fqdn,
            content,
            priority,
            ttl: args.ttl,
            status: "pending",
            createdAt: now(),
            updatedAt: now(),
        });

        // Create audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "dns_record_created_api",
            details: `Created ${args.type} record via API: ${fqdn} → ${content}`,
            timestamp: now(),
            status: "success",
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

export const updateRecordInternal = internalMutation({
    args: {
        recordId: v.id("dns_records"),
        userId: v.id("users"),
        // domainId is not needed to look up, but good for validation if provided, ignoring here
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(), // relative
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const record = await ctx.db.get(args.recordId);
        if (!record) throw new Error("Record not found");
        if (record.userId !== args.userId) throw new Error("Unauthorized");

        const userId = args.userId;

        // Check rate limit for DNS operations
        await checkDnsOperationsRateLimit(ctx, userId);

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

        let priority = args.priority;
        if (args.type === "MX" && !priority) {
            priority = 10;
        }

        // Update DB
        await ctx.db.patch(args.recordId, {
            type: args.type,
            name,
            fqdn,
            content,
            priority,
            ttl: args.ttl,
            status: "pending",
            updatedAt: now(),
            lastError: undefined,
        });

        // Create audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "dns_record_updated_api",
            details: `Updated ${args.type} record via API: ${fqdn} → ${content}`,
            timestamp: now(),
            status: "success",
        });

        // Enqueue Job
        await ctx.scheduler.runAfter(0, internal.dnsJobs.enqueueUpsert, {
            domainId: record.domainId,
            recordId: record._id,
        });

        return { success: true };
    },
});

export const deleteRecordInternal = internalMutation({
    args: {
        recordId: v.id("dns_records"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;
        const record = await ctx.db.get(args.recordId);
        if (!record) throw new Error("Record not found");
        if (record.userId !== userId) throw new Error("Unauthorized");

        // Check rate limit for DNS operations
        await checkDnsOperationsRateLimit(ctx, userId);

        // Mark deleting
        await ctx.db.patch(args.recordId, { status: "deleting", updatedAt: now() });

        // Create audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "dns_record_deleted_api",
            details: `Deleted ${record.type} record via API: ${record.fqdn}`,
            timestamp: now(),
            status: "success",
        });

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

        return { success: true };
    }
});
