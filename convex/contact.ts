import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { auth } from "./auth";

export const submit = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        await ctx.db.insert("messages", {
            name: args.name,
            email: args.email,
            subject: args.subject,
            message: args.message,
            userId: userId || undefined,
            status: "unread",
            createdAt: Date.now(),
        });
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_created")
            .order("desc")
            .collect();
        return messages;
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("messages"),
        status: v.union(v.literal("read"), v.literal("unread"), v.literal("replied")),
    },
    handler: async (ctx, args) => {
        const { user } = await requireAdmin(ctx);
        const current = await ctx.db.get(args.id);
        if (!current) throw new Error("Message not found");

        await ctx.db.patch(args.id, {
            status: args.status,
            readAt: args.status === "read" ? Date.now() : current.readAt,
        });

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "message_status_updated",
            details: `Message ${args.id} status changed to ${args.status}`,
            timestamp: Date.now(),
            status: "success",
        });
    },
});

export const deleteMessage = mutation({
    args: { id: v.id("messages") },
    handler: async (ctx, args) => {
        const { user } = await requireAdmin(ctx);
        await ctx.db.delete(args.id);

        // Audit log
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "message_deleted",
            details: `Message ${args.id} deleted`,
            timestamp: Date.now(),
            status: "success",
        });
    },
});
