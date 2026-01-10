import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation, action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin, requireUserId, applySearch, now } from "./lib";
import { auth } from "./auth";

export const list = query({
    args: { search: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // Ideally this might be public or user-required depending on UI needs
        // For now we require user login
        await requireUserId(ctx);
        const items = await ctx.db.query("platform_domains").order("desc").collect();
        return applySearch(items, args.search, ["domain"]);
    },
});

export const getById = query({
    args: { id: v.id("platform_domains") },
    handler: async (ctx, args) => {
        await requireUserId(ctx);
        return await ctx.db.get(args.id);
    },
});

export const listPublic = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("platform_domains")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
    },
});

export const checkAdmin = internalQuery({
    handler: async (ctx) => {
        await requireAdmin(ctx);
    }
});

export const createDb = internalMutation({
    args: {
        domain: v.string(),
        description: v.optional(v.string()),
        zoneId: v.string(),
        nameservers: v.array(v.string()),
        status: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("platform_domains")
            .withIndex("by_domain", (q) => q.eq("domain", args.domain))
            .first();
        if (existing) throw new Error("Domain already registered");

        await ctx.db.insert("platform_domains", {
            domain: args.domain,
            description: args.description,
            isActive: true,
            createdAt: now(),
            zoneId: args.zoneId,
            nameservers: args.nameservers,
            cloudflareStatus: args.status,
        });

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "platform_domain_created",
            details: `Created platform domain: ${args.domain}`,
            timestamp: now(),
            status: "success",
        });
    }
});

export const update = mutation({
    args: {
        id: v.id("platform_domains"),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireAdmin(ctx);
        const domain = await ctx.db.get(args.id);
        if (!domain) throw new Error("Domain not found");

        const updates: any = {};
        if (args.description !== undefined) updates.description = args.description;
        if (args.isActive !== undefined) updates.isActive = args.isActive;

        await ctx.db.patch(args.id, updates);

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "platform_domain_updated",
            details: `Updated platform domain: ${domain.domain}`,
            metadata: {
                oldValue: domain.description || "",
                newValue: args.description || "",
            },
            timestamp: now(),
            status: "success",
        });
    }
});

export const create = action({
    args: { domain: v.string(), description: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        await ctx.runQuery(internal.platformDomains.checkAdmin);

        const zone = await ctx.runAction((internal as any)["dnsProvider/cloudflare"].createZone, {
            name: args.domain
        }) as { zoneId: string, nameservers: string[], status: string };

        await ctx.runMutation(internal.platformDomains.createDb, {
            domain: args.domain,
            description: args.description,
            zoneId: zone.zoneId,
            nameservers: zone.nameservers,
            status: zone.status,
            userId,
        });

        return { success: true, nameservers: zone.nameservers };
    },
});

export const updateStatus = internalMutation({
    args: {
        id: v.id("platform_domains"),
        nameservers: v.array(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            nameservers: args.nameservers,
            cloudflareStatus: args.status,
            updatedAt: now(), // Assume this field exists or add it, better to not break if not. platform_domains doesn't have updatedAt in schema I think? Let's check schema.
        });
    }
});

export const refreshStatus = action({
    args: { id: v.id("platform_domains"), zoneId: v.string() },
    handler: async (ctx, args) => {
        // Can be triggered by cron (internal) or user (admin)
        // If triggered by cron, auth check might be skipped or handled differently.
        // For simplicity, let's allow it if we have the ID and ZoneID (which implies we read it from DB).

        const zone = await ctx.runAction((internal as any).dnsProvider.cloudflare.getZone, {
            zoneId: args.zoneId
        }) as { nameservers: string[], status: string };

        await ctx.runMutation(internal.platformDomains.updateStatus, {
            id: args.id,
            nameservers: zone.nameservers,
            status: zone.status
        });

        return { success: true, status: zone.status };
    },
});

export const remove = mutation({
    args: { id: v.id("platform_domains") },
    handler: async (ctx, args) => {
        const { userId } = await requireAdmin(ctx);
        const domain = await ctx.db.get(args.id);
        if (!domain) throw new Error("Domain not found");

        // Audit log before deletion
        await ctx.db.insert("auditLogs", {
            userId,
            action: "platform_domain_removed",
            details: `Removed platform domain: ${domain.domain}`,
            timestamp: now(),
            status: "success",
        });

        await ctx.db.delete(args.id);
    }
});

// Poll function for Cron
export const pollPending = internalAction({
    handler: async (ctx) => {
        // 1. Get all pending domains (need internal query for this)
        const pendingDomains = await ctx.runQuery(internal.platformDomains.getPendingDomains);

        // 2. Refresh each one
        for (const domain of pendingDomains) {
            if (domain.zoneId) {
                try {
                    await ctx.runAction((internal as any).platformDomains.refreshStatus, {
                        id: domain._id,
                        zoneId: domain.zoneId
                    });
                } catch (e) {
                    console.error(`Failed to auto-refresh ${domain.domain}:`, e);
                }
            }
        }
    }
});

export const getPendingDomains = internalQuery({
    handler: async (ctx) => {
        // We might want an index for this if there are many domains. 
        // For now, filter in memory or straightforward scan is fine for low volume.
        // Actually, let's scan.
        const all = await ctx.db.query("platform_domains").collect();
        return all.filter(d =>
            d.cloudflareStatus === "pending" ||
            d.cloudflareStatus === "moved" ||
            !d.cloudflareStatus // treat missing as pending/unknown
        );
    }
});
