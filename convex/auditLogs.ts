import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { auth } from "./auth";

/**
 * Create an audit log entry for user actions (internal)
 */
export const createAuditLog = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        oldValue: v.optional(v.string()),
        newValue: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
      })
    ),
    status: v.string(), // "success" or "failed"
  },
  handler: async (ctx, args) => {
    // If userId not provided, try to get from auth context (fallback)
    const userId = args.userId || await auth.getUserId(ctx);

    // If we still don't have a user, we can't log to auditLogs (requires userId)
    // We might log a warning or just return. But for API calls, userId is always passed.
    if (!userId) {
      // Allow specific system actions or throw? 
      // For now, fail safe.
      console.warn("createAuditLog called without userId");
      return { success: false };
    }

    await ctx.db.insert("auditLogs", {
      userId,
      action: args.action,
      details: args.details,
      metadata: args.metadata,
      timestamp: Date.now(),
      status: args.status,
    });

    return { success: true };
  },
});

/**
 * Create an audit log entry (public mutation for direct use)
 */
export const logAction = mutation({
  args: {
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        oldValue: v.optional(v.string()),
        newValue: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
      })
    ),
    status: v.string(), // "success" or "failed"
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    await ctx.db.insert("auditLogs", {
      userId,
      action: args.action,
      details: args.details,
      metadata: args.metadata,
      timestamp: Date.now(),
      status: args.status,
    });

    return { success: true };
  },
});

/**
 * Get audit logs for the current user
 */
export const getUserAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 50;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user_and_timestamp", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return logs;
  },
});

/**
 * Get all audit logs (Admin only - you'll need to add role checking)
 */
export const getAllAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error("User must be authenticated");
    }

    // Admin role check
    const user = await ctx.db.get(currentUserId);
    if (user?.role !== "admin") {
      throw new Error("Only admins can view all audit logs");
    }

    const limit = args.limit || 100;

    let logs;

    // Filter by specific user if provided
    if (args.userId !== undefined) {
      const queryBuilder = ctx.db.query("auditLogs");
      logs = await queryBuilder
        .withIndex("by_user_and_timestamp", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(limit);
    } else {
      const queryBuilder = ctx.db.query("auditLogs");
      logs = await queryBuilder
        .withIndex("by_timestamp")
        .order("desc")
        .take(limit);
    }

    // Enrich with user information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        let user: any = await ctx.db.get(log.userId);

        // If user not found in active users, check archived users
        if (!user) {
          user = await ctx.db
            .query("archived_users")
            .withIndex("by_original_user_id", (q) => q.eq("originalUserId", log.userId))
            .first();
        }

        return {
          ...log,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "No email",
        };
      })
    );

    return enrichedLogs;
  },
});

/**
 * Get audit logs statistics for admin dashboard
 * ADMIN ONLY
 */
export const getAuditLogsStats = query({
  args: {
    timeRange: v.optional(v.string()), // "24h", "7d", "30d"
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error("User must be authenticated");
    }

    // Security: Only admins can view audit log statistics
    const user = await ctx.db.get(currentUserId);
    if (user?.role !== "admin") {
      throw new Error("Only admins can view audit log statistics");
    }

    const timeRange = args.timeRange || "7d";
    let startTime = Date.now();

    switch (timeRange) {
      case "24h":
        startTime -= 24 * 60 * 60 * 1000;
        break;
      case "7d":
        startTime -= 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        startTime -= 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    // Calculate statistics
    const totalActions = logs.length;
    const successfulActions = logs.filter((log) => log.status === "success").length;
    const failedActions = logs.filter((log) => log.status === "failed").length;

    // Group by action type
    const actionCounts: Record<string, number> = {};
    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    // Get unique users
    const uniqueUsers = new Set(logs.map((log) => log.userId)).size;

    return {
      totalActions,
      successfulActions,
      failedActions,
      uniqueUsers,
      actionCounts,
      timeRange,
    };
  },
});

/**
 * Delete old audit logs (cleanup function - run via cron or manually)
 * ADMIN ONLY - prevents unauthorized deletion of forensic evidence
 */
export const deleteOldAuditLogs = mutation({
  args: {
    daysToKeep: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error("User must be authenticated");
    }

    // Security: Only admins can delete audit logs
    const user = await ctx.db.get(currentUserId);
    if (user?.role !== "admin") {
      throw new Error("Only admins can delete audit logs");
    }

    // Validate input to prevent abuse
    if (args.daysToKeep < 1) {
      throw new Error("daysToKeep must be at least 1");
    }

    const cutoffTime = Date.now() - args.daysToKeep * 24 * 60 * 60 * 1000;

    const oldLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTime))
      .collect();

    let deletedCount = 0;
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
      deletedCount++;
    }

    // Log the deletion action itself
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "audit_logs_cleaned",
      details: `Deleted ${deletedCount} audit logs older than ${args.daysToKeep} days`,
      timestamp: Date.now(),
      status: "success",
    });

    return { deletedCount };
  },
});
