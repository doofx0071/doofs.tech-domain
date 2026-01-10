/**
 * Platform DNS Management (Admin-only)
 * Manage DNS records for platform root domains (e.g., doofs.tech)
 */

import { v } from "convex/values";
import { action, mutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin, now } from "./lib";

// Internal query to get platform domain
export const getPlatformDomainInternal = internalQuery({
    args: { id: v.id("platform_domains") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// List DNS records from Cloudflare for a platform domain
export const listRecords = action({
    args: { platformDomainId: v.id("platform_domains") },
    handler: async (ctx, args): Promise<any[]> => {
        // Get platform domain info
        const platformDomain = await ctx.runQuery(internal.platformDns.getPlatformDomainInternal, { id: args.platformDomainId });
        if (!platformDomain) throw new Error("Platform domain not found");
        if (!platformDomain.zoneId) throw new Error("Platform domain has no Cloudflare zone");

        // Fetch records from Cloudflare
        const cloudflareRecords = await ctx.runAction((internal as any).dnsProvider.cloudflare.listRecords, {
            zoneId: platformDomain.zoneId
        });

        return cloudflareRecords as any[];
    },
});

// Create DNS record for platform domain
export const createRecord = mutation({
    args: {
        platformDomainId: v.id("platform_domains"),
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(),
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireAdmin(ctx);

        const platformDomain = await ctx.db.get(args.platformDomainId);
        if (!platformDomain) throw new Error("Platform domain not found");

        // Compute FQDN
        const name = args.name === "@" ? "" : args.name;
        const fqdn = name ? `${name}.${platformDomain.domain}` : platformDomain.domain;

        const recordId = await ctx.db.insert("dns_records", {
            domainId: undefined as any, // No user domain, platform-level
            userId,
            rootDomain: platformDomain.domain,
            subdomain: "@",
            type: args.type,
            name: args.name,
            fqdn,
            content: args.content,
            priority: args.priority,
            ttl: args.ttl || 1,
            status: "pending",
            createdAt: now(),
            updatedAt: now(),
        });

        // Enqueue DNS job
        await ctx.scheduler.runAfter(0, internal.dnsJobs.processDue);
        await ctx.db.insert("dns_jobs", {
            jobType: "UPSERT_RECORD",
            domainId: undefined as any,
            recordId,
            status: "queued",
            attempts: 0,
            idempotencyKey: Math.random().toString(36).slice(2),
            createdAt: now(),
            updatedAt: now(),
        });

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "platform_dns_created",
            details: `Created ${args.type} record for ${platformDomain.domain}: ${args.name} → ${args.content}`,
            timestamp: now(),
            status: "success",
        });

        return recordId;
    },
});

// Update DNS record
export const updateRecord = mutation({
    args: {
        recordId: v.id("dns_records"),
        type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
        name: v.string(),
        content: v.string(),
        priority: v.optional(v.number()),
        ttl: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireAdmin(ctx);

        const record = await ctx.db.get(args.recordId);
        if (!record) throw new Error("Record not found");

        const oldContent = `${record.type} ${record.name} → ${record.content}`;

        // Compute new FQDN
        const name = args.name === "@" ? "" : args.name;
        const fqdn = name ? `${name}.${record.rootDomain}` : record.rootDomain;

        await ctx.db.patch(args.recordId, {
            type: args.type,
            name: args.name,
            fqdn,
            content: args.content,
            priority: args.priority,
            ttl: args.ttl,
            status: "pending",
            updatedAt: now(),
            lastError: undefined,
        });

        // Enqueue job
        await ctx.scheduler.runAfter(0, internal.dnsJobs.processDue);

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "platform_dns_updated",
            details: `Updated DNS record for ${record.rootDomain}`,
            metadata: {
                oldValue: oldContent,
                newValue: `${args.type} ${args.name} → ${args.content}`,
            },
            timestamp: now(),
            status: "success",
        });
    },
});

// Delete DNS record
export const deleteRecord = mutation({
    args: { recordId: v.id("dns_records") },
    handler: async (ctx, args) => {
        const { userId } = await requireAdmin(ctx);

        const record = await ctx.db.get(args.recordId);
        if (!record) throw new Error("Record not found");

        // Mark as deleting
        await ctx.db.patch(args.recordId, { status: "deleting", updatedAt: now() });

        // Enqueue delete job
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

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "platform_dns_deleted",
            details: `Deleted ${record.type} record for ${record.rootDomain}: ${record.name} → ${record.content}`,
            timestamp: now(),
            status: "success",
        });
    },
});
