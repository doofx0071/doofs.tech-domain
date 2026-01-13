import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// List notifications for the current user
export const list = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const limit = args.limit || 20;

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(limit);

        // Get current user to check role
        const user = await ctx.db.get(userId);
        const isAdmin = user?.role === "admin";

        // Filter out adminDetails for non-admins
        return notifications.map((n) => {
            if (isAdmin) return n;
            const { adminDetails, ...publicData } = n;
            return publicData;
        });
    },
});

// Mark a single notification as read
export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const notification = await ctx.db.get(args.id);
        if (!notification || notification.userId !== userId) {
            throw new Error("Notification not found");
        }

        await ctx.db.patch(args.id, { read: true });
    },
});

// Mark all notifications as read for the current user
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", false))
            .collect();

        await Promise.all(unread.map(n => ctx.db.patch(n._id, { read: true })));
    }
});

// Internal query to get all admin user IDs
export const getAdminUserIds = internalQuery({
    args: {},
    handler: async (ctx) => {
        const admins = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "admin"))
            .collect();
        return admins.map(a => a._id);
    }
});

// Internal mutation to create notifications (called by other backend functions)
export const createInternal = internalMutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
        title: v.string(),
        message: v.string(),
        link: v.optional(v.string()),
        domainId: v.optional(v.id("domains")),
        rootDomain: v.optional(v.string()),
        adminDetails: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            title: args.title,
            message: args.message,
            link: args.link,
            domainId: args.domainId,
            rootDomain: args.rootDomain,
            adminDetails: args.adminDetails,
            read: false,
            timestamp: Date.now(),
        });
    },
});

// Internal mutation to notify all admins (called by other backend functions)
export const notifyAdmins = internalMutation({
    args: {
        type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
        title: v.string(),
        message: v.string(),
        link: v.optional(v.string()),
        domainId: v.optional(v.id("domains")),
        rootDomain: v.optional(v.string()),
        adminDetails: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get all admin users
        const admins = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "admin"))
            .collect();

        // Create notification for each admin
        await Promise.all(admins.map(admin =>
            ctx.db.insert("notifications", {
                userId: admin._id,
                type: args.type,
                title: args.title,
                message: args.message,
                link: args.link,
                domainId: args.domainId,
                rootDomain: args.rootDomain,
                adminDetails: args.adminDetails,
                read: false,
                timestamp: Date.now(),
            })
        ));
    },
});

// Get unread count for badge
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", false))
            .collect();

        return unread.length;
    }
});
