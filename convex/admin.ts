/**
 * Admin Management Functions
 * Handles creating and managing admin users
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { requireAdmin, requireUserId } from "./lib";

/**
 * Make a user an admin
 * First user to call this becomes admin, then requires admin auth
 */
export const makeUserAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if any admin exists
    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    // If this is the first admin, allow creation
    if (existingAdmins.length === 0) {
      await ctx.db.patch(args.userId, { role: "admin" as "admin" | "user" });
      return { success: true, message: "First admin created successfully!" };
    }

    // Otherwise, require authentication and admin role
    await requireAdmin(ctx);

    await ctx.db.patch(args.userId, { role: "admin" as "admin" | "user" });
    return { success: true, message: "User promoted to admin" };
  },
});

/**
 * Make yourself admin (one-time use for initial setup)
 * This checks if you're the first user or if no admins exist
 */
export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    // Check if any admin exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (existingAdmin) {
      throw new Error("An admin already exists. Contact existing admin for access.");
    }

    // Make this user the first admin
    await ctx.db.patch(userId, { role: "admin" as "admin" | "user" });

    // Log the admin creation
    await ctx.db.insert("auditLogs", {
      userId,
      action: "admin_created",
      details: "First admin user created via admin login",
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true, message: "You are now the admin!" };
  },
});

/**
 * Check if any admin exists in the system
 */
export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();
    return !!adminUser;
  },
});

/**
 * Remove admin role from a user
 */
export const removeAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);
    const targetUser = await ctx.db.get(args.userId);

    // Prevent removing yourself if you're the last admin
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    if (allAdmins.length === 1 && allAdmins[0]._id === args.userId) {
      throw new Error("Cannot remove the last admin");
    }

    await ctx.db.patch(args.userId, { role: "user" as "admin" | "user" });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "user_demoted",
      details: `Demoted user ${targetUser?.email || args.userId} from admin`,
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true, message: "Admin role removed" };
  },
});

/**
 * Suspend a user (temporary disable)
 */
export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);

    if (currentUserId === args.userId) {
      throw new Error("Cannot suspend yourself");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");
    if (targetUser.role === "admin") {
      throw new Error("Cannot suspend an admin. Demote first.");
    }

    await ctx.db.patch(args.userId, {
      status: "suspended",
      statusReason: args.reason,
      statusUpdatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "user_suspended",
      details: `Suspended user: ${targetUser.email}${args.reason ? ` - Reason: ${args.reason}` : ""}`,
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

/**
 * Unsuspend a user
 */
export const unsuspendUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      status: "active",
      statusReason: undefined,
      statusUpdatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "user_unsuspended",
      details: `Unsuspended user: ${targetUser.email}`,
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

/**
 * Ban a user (permanent disable)
 */
export const banUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);

    if (currentUserId === args.userId) {
      throw new Error("Cannot ban yourself");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");
    if (targetUser.role === "admin") {
      throw new Error("Cannot ban an admin. Demote first.");
    }

    await ctx.db.patch(args.userId, {
      status: "banned",
      statusReason: args.reason,
      statusUpdatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "user_banned",
      details: `Banned user: ${targetUser.email}${args.reason ? ` - Reason: ${args.reason}` : ""}`,
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

/**
 * Unban a user
 */
export const unbanUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      status: "active",
      statusReason: undefined,
      statusUpdatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "user_unbanned",
      details: `Unbanned user: ${targetUser.email}`,
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

/**
 * Update status reason for a user
 */
export const updateStatusReason = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");
    if (targetUser.status !== "suspended" && targetUser.status !== "banned") {
      throw new Error("Can only update reason for suspended or banned users");
    }

    const oldReason = targetUser.statusReason || "";

    await ctx.db.patch(args.userId, {
      statusReason: args.reason,
      statusUpdatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "status_reason_updated",
      details: `Updated status reason for ${targetUser.email}`,
      metadata: {
        oldValue: oldReason,
        newValue: args.reason,
      },
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

/**
 * Delete a user (archive - soft delete)
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAdmin(ctx);

    if (currentUserId === args.userId) {
      throw new Error("Cannot delete yourself");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");
    if (targetUser.role === "admin") {
      throw new Error("Cannot delete an admin. Demote first.");
    }

    // Archive user data
    await ctx.db.insert("archived_users", {
      originalUserId: args.userId,
      name: targetUser.name,
      email: targetUser.email,
      image: targetUser.image,
      avatar: targetUser.avatar,
      avatarVariant: targetUser.avatarVariant,
      role: targetUser.role,
      archivedAt: Date.now(),
      archivedBy: currentUserId,
    });

    // Delete auth accounts linked to this user
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", args.userId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    // Delete sessions
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Audit log before deleting user
    await ctx.db.insert("auditLogs", {
      userId: currentUserId,
      action: "user_deleted",
      details: `Deleted user: ${targetUser.email}`,
      timestamp: Date.now(),
      status: "success",
    });

    // Delete the user
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});

/**
 * Check if current user is admin
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId);
    return user?.role === "admin";
  },
});

/**
 * Get all admin users
 */
export const getAllAdmins = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    return admins.map(admin => ({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    }));
  },
});

/**
 * Get all users (Admin only)
 */
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit || 100;
    const users = await ctx.db.query("users").take(limit);

    return users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      status: u.status || "active",
      statusReason: u.statusReason,
      joined: u._creationTime,
      lastLoginAt: u.lastLoginAt,
    }));
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const userCount = (await ctx.db.query("users").collect()).length;
    const domainCount = (await ctx.db.query("domains").collect()).length;
    const recordCount = (await ctx.db.query("dns_records").collect()).length;

    // Simple uptime mock since we don't monitor it
    const uptime = "99.9%";

    return {
      totalUsers: userCount,
      activeDomains: domainCount,
      dnsRecords: recordCount,
      uptime
    };
  }
});

export const getAllDomains = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit || 100;

    let domains;
    if (args.search) {
      domains = await ctx.db
        .query("domains")
        .withSearchIndex("search_subdomain", (q) => q.search("subdomain", args.search!))
        .take(limit);
    } else {
      domains = await ctx.db.query("domains").order("desc").take(limit);
    }

    return await Promise.all(domains.map(async (d) => {
      let ownerEmail = d.ownerEmail;
      let ownerName = undefined;

      if (d.userId) {
        const user = await ctx.db.get(d.userId);
        if (user) {
          ownerEmail = user.email;
          ownerName = user.name;
        }
      }

      return {
        _id: d._id,
        subdomain: d.subdomain,
        rootDomain: d.rootDomain,
        ownerEmail,
        ownerName,
        status: d.status,
        createdAt: d._creationTime
      };
    }));
  },
});

export const getRecentDomains = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit || 5;

    const domains = await ctx.db.query("domains").order("desc").take(limit);

    return await Promise.all(domains.map(async (d) => {
      let ownerEmail = d.ownerEmail;
      let ownerName = undefined;

      if (d.userId) {
        const user = await ctx.db.get(d.userId);
        if (user) {
          ownerEmail = user.email;
          ownerName = user.name;
        }
      }

      return {
        _id: d._id,
        subdomain: d.subdomain,
        ownerEmail,
        ownerName,
        status: d.status,
        createdAt: d._creationTime
      };
    }));
  }
});
