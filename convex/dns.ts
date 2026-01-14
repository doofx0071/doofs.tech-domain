import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { requireUserId, now, checkDnsRecordLimit } from "./lib";

import { checkDnsOperationsRateLimit } from "./ratelimit";
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

        // Default priority for MX records (required by Cloudflare)
        let priority = args.priority;
        if (args.type === "MX" && !priority) {
            priority = 10; // Default priority for MX records
        }

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
            priority,
            ttl: args.ttl,
            status: "pending",
            createdAt: now(),
            updatedAt: now(),
        });

        // Create audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "dns_record_created",
            details: `Created ${args.type} record: ${fqdn} → ${content}`,
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

        // Check rate limit for DNS operations
        await checkDnsOperationsRateLimit(ctx, userId);

        // Mark deleting
        await ctx.db.patch(args.recordId, { status: "deleting", updatedAt: now() });

        // Create audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "dns_record_deleted",
            details: `Deleted ${record.type} record: ${record.fqdn}`,
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

        // Default priority for MX records (required by Cloudflare)
        let priority = args.priority;
        if (args.type === "MX" && !priority) {
            priority = 10; // Default priority for MX records
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
            lastError: undefined, // Clear previous errors
        });

        // Create audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "dns_record_updated",
            details: `Updated ${args.type} record: ${fqdn} → ${content}`,
            timestamp: now(),
            status: "success",
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

/**
 * Verify if a DNS record has propagated to Cloudflare Public DNS
 */
export const verifyPropagation = action({
    args: {
        recordId: v.id("dns_records"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Verify user status (suspension, etc)
        await ctx.runQuery(internal.users.verifyUserInternal);

        // We need to fetch the record first to get the name/type
        // Actions can't query DB directly, so we need a helper query or pass details
        // Pattern: Call internal query to get record details
        const record = await ctx.runQuery(internal.dnsJobs.getRecordForJob, { recordId: args.recordId });

        if (!record) throw new Error("Record not found");
        if (record.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const type = record.type;

        const name = record.fqdn;

        // Query Cloudflare DoH
        // https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/
        const url = `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`;

        const resp = await fetch(url, {
            headers: { 'Accept': 'application/dns-json' }
        });

        if (!resp.ok) {
            throw new Error(`DoH check failed: ${resp.statusText}`);
        }

        const data: any = await resp.json();

        // Check if Answer matches content
        const answers: any[] = data.Answer || [];
        const isPropagated = answers.some((a: any) => {
            // Cloudflare DoH returns data in "data" field
            // simplistic check:
            return a.data && (a.data.includes(record.content) || record.content.includes(a.data));
        });

        return {
            propagated: isPropagated,
            details: data
        };
    }
});

/**
 * Export domain zone file (BIND format)
 */
export const exportZoneFile = query({
    args: { domainId: v.id("domains") },
    handler: async (ctx, args) => {
        await assertDomainOwner(ctx, args.domainId);

        const domain = await ctx.db.get(args.domainId);
        if (!domain) throw new Error("Domain not found");

        const records = await ctx.db
            .query("dns_records")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .collect();

        let zoneFile = `$ORIGIN ${domain.subdomain}.${domain.rootDomain}.\n`;
        zoneFile += `$TTL 3600\n`;
        zoneFile += `; Exported from Doofs.Tech\n\n`;

        records.forEach(r => {
            const name = r.name === "@" ? "@" : r.name;
            const priority = r.priority ? ` ${r.priority}` : "";
            zoneFile += `${name}\tIN\t${r.type}${priority}\t${r.content}\n`;
        });

        return zoneFile;
    }
});
