/**
 * Admin Management Functions
 * Handles creating and managing admin users
 */

import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { requireAdmin, requireUserId } from "./lib";

/**
 * Check if an email is in the allowed admin list
 * Set ALLOWED_ADMIN_EMAILS env var as comma-separated list of emails
 * If not set, no one can become the first admin programmatically
 */
function isEmailAllowedAsAdmin(email: string | undefined): boolean {
  const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS;

  // If no allowlist is configured, block programmatic first-admin creation
  // Admin must be manually assigned via Convex dashboard in this case
  if (!allowedEmails) {
    return false;
  }

  if (!email) {
    return false;
  }

  const allowedList = allowedEmails.split(",").map(e => e.trim().toLowerCase());
  return allowedList.includes(email.toLowerCase());
}

/**
 * Make a user an admin
 * First user to call this becomes admin (if on allowlist), then requires admin auth
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

    // If this is the first admin, verify email allowlist
    if (existingAdmins.length === 0) {
      const targetUser = await ctx.db.get(args.userId);
      if (!isEmailAllowedAsAdmin(targetUser?.email)) {
        throw new Error(
          "Email not authorized for admin access. Contact the platform operator to be added to the admin allowlist."
        );
      }

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
 * SECURITY: Only works if your email is in ALLOWED_ADMIN_EMAILS env var
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

    // Security: Verify the user's email is on the allowed admin list
    const user = await ctx.db.get(userId);
    if (!isEmailAllowedAsAdmin(user?.email)) {
      throw new Error(
        "Your email is not authorized for admin access. Contact the platform operator to be added to the admin allowlist, or manually assign admin role via Convex dashboard."
      );
    }

    // Make this user the first admin
    await ctx.db.patch(userId, { role: "admin" as "admin" | "user" });

    // Log the admin creation
    await ctx.db.insert("auditLogs", {
      userId,
      action: "admin_created",
      details: `First admin user created via admin login (${user?.email})`,
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
 * Get all admin users (internal use)
 */
export const internalGetAllAdmins = internalQuery({
  args: {},
  handler: async (ctx) => {
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
import { paginationOptsValidator } from "convex/server";

/**
 * Get all users (Admin only) - Paginated
 */
export const getAllUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").paginate(args.paginationOpts);

    return {
      ...users,
      page: users.page.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || "user",
        status: u.status || "active",
        statusReason: u.statusReason,
        joined: u._creationTime,
        lastLoginAt: u.lastLoginAt,
      }))
    };
  },
});

export const getRecentUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit || 5;

    const users = await ctx.db.query("users").order("desc").take(limit);

    return users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      status: u.status || "active",
      joined: u._creationTime,
      lastLoginAt: u.lastLoginAt,
    }));
  }
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get all data
    const allUsers = await ctx.db.query("users").collect();
    const allDomains = await ctx.db.query("domains").collect();
    const allRecords = await ctx.db.query("dns_records").collect();
    const recentAuditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), sevenDaysAgo))
      .collect();

    // User metrics
    const totalUsers = allUsers.length;
    const newUsersLast7Days = allUsers.filter(u => u._creationTime >= sevenDaysAgo).length;
    const newUsersLast30Days = allUsers.filter(u => u._creationTime >= thirtyDaysAgo).length;
    const userGrowthRate7d = totalUsers > 0 ? ((newUsersLast7Days / totalUsers) * 100).toFixed(1) : "0";

    // Domain metrics
    const activeDomains = allDomains.filter(d => d.status === "active").length;
    const inactiveDomains = allDomains.filter(d => d.status === "inactive").length;
    const newDomainsLast7Days = allDomains.filter(d => d._creationTime >= sevenDaysAgo).length;
    const domainGrowthRate7d = allDomains.length > 0 ? ((newDomainsLast7Days / allDomains.length) * 100).toFixed(1) : "0";

    // DNS metrics
    const totalDnsRecords = allRecords.length;
    const activeDnsRecords = allRecords.filter(r => r.status === "active").length;
    const errorDnsRecords = allRecords.filter(r => r.status === "error").length;
    const dnsSuccessRate = totalDnsRecords > 0 ? ((activeDnsRecords / totalDnsRecords) * 100).toFixed(1) : "100";

    // Activity metrics
    const successfulActions = recentAuditLogs.filter(log => log.status === "success").length;
    const failedActions = recentAuditLogs.filter(log => log.status === "failed").length;
    const totalActions = recentAuditLogs.length;
    const successRate = totalActions > 0 ? ((successfulActions / totalActions) * 100).toFixed(1) : "100";

    return {
      totalUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      userGrowthRate7d,
      activeDomains,
      inactiveDomains,
      totalDomains: allDomains.length,
      newDomainsLast7Days,
      domainGrowthRate7d,
      dnsRecords: totalDnsRecords,
      activeDnsRecords,
      errorDnsRecords,
      dnsSuccessRate,
      totalActionsLast7Days: totalActions,
      successRate,
      uptime: "99.9%",
    };
  }
});

export const getAllDomains = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let results;
    if (args.search) {
      results = await ctx.db
        .query("domains")
        .withSearchIndex("search_subdomain", (q) => q.search("subdomain", args.search!))
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db.query("domains").order("desc").paginate(args.paginationOpts);
    }

    const pageWithUserInfo = await Promise.all(results.page.map(async (d) => {
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

    return {
      ...results,
      page: pageWithUserInfo
    };
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

/**
 * Get user growth data for charts (daily signups over time)
 */
export const getUserGrowthData = query({
  args: {
    days: v.optional(v.number()), // defaults to 30
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const users = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("_creationTime"), startTime))
      .collect();

    // Group by day
    const dailyGroups: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyGroups[dateKey] = 0;
    }

    users.forEach(user => {
      const date = new Date(user._creationTime);
      const dateKey = date.toISOString().split('T')[0];
      if (dailyGroups.hasOwnProperty(dateKey)) {
        dailyGroups[dateKey]++;
      }
    });

    // Convert to array and sort
    const data = Object.entries(dailyGroups)
      .map(([date, count]) => ({
        date,
        count,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return data;
  }
});

/**
 * Get domain creation data for charts (daily domain creation over time)
 */
export const getDomainCreationData = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const domains = await ctx.db
      .query("domains")
      .filter((q) => q.gte(q.field("_creationTime"), startTime))
      .collect();

    // Group by day and status
    const dailyGroups: Record<string, { active: number; inactive: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyGroups[dateKey] = { active: 0, inactive: 0 };
    }

    domains.forEach(domain => {
      const date = new Date(domain._creationTime);
      const dateKey = date.toISOString().split('T')[0];
      if (dailyGroups.hasOwnProperty(dateKey)) {
        if (domain.status === "active") {
          dailyGroups[dateKey].active++;
        } else {
          dailyGroups[dateKey].inactive++;
        }
      }
    });

    // Convert to array
    const data = Object.entries(dailyGroups)
      .map(([date, counts]) => ({
        date,
        active: counts.active,
        inactive: counts.inactive,
        total: counts.active + counts.inactive,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return data;
  }
});

/**
 * Get DNS operations data for charts (by record type)
 */
export const getDnsOperationsData = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const records = await ctx.db.query("dns_records").collect();

    // Group by type and status
    const typeGroups: Record<string, { success: number; error: number }> = {
      A: { success: 0, error: 0 },
      AAAA: { success: 0, error: 0 },
      CNAME: { success: 0, error: 0 },
      TXT: { success: 0, error: 0 },
      MX: { success: 0, error: 0 },
    };

    records.forEach(record => {
      if (typeGroups.hasOwnProperty(record.type)) {
        if (record.status === "active") {
          typeGroups[record.type].success++;
        } else if (record.status === "error") {
          typeGroups[record.type].error++;
        }
      }
    });

    // Convert to array
    const data = Object.entries(typeGroups).map(([type, counts]) => ({
      type,
      success: counts.success,
      error: counts.error,
      total: counts.success + counts.error,
    }));

    return data;
  }
});

/**
 * Get activity timeline data for charts (hourly activity)
 */
export const getActivityTimelineData = query({
  args: {
    timeRange: v.optional(v.string()), // "24h", "7d", "30d"
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const timeRange = args.timeRange || "24h";
    let startTime = Date.now();
    let hours = 24;

    switch (timeRange) {
      case "24h":
        startTime -= 24 * 60 * 60 * 1000;
        hours = 24;
        break;
      case "7d":
        startTime -= 7 * 24 * 60 * 60 * 1000;
        hours = 7 * 24;
        break;
      case "30d":
        startTime -= 30 * 24 * 60 * 60 * 1000;
        hours = 30 * 24;
        break;
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    // Group by hour
    const hourlyGroups: Record<string, { success: number; failed: number }> = {};

    for (let i = 0; i < hours; i++) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourKey = time.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyGroups[hourKey] = { success: 0, failed: 0 };
    }

    logs.forEach(log => {
      const time = new Date(log.timestamp);
      const hourKey = time.toISOString().slice(0, 13);
      if (hourlyGroups.hasOwnProperty(hourKey)) {
        if (log.status === "success") {
          hourlyGroups[hourKey].success++;
        } else {
          hourlyGroups[hourKey].failed++;
        }
      }
    });

    // Convert to array and sort
    const data = Object.entries(hourlyGroups)
      .map(([hour, counts]) => {
        const date = new Date(hour);
        return {
          hour,
          success: counts.success,
          failed: counts.failed,
          total: counts.success + counts.failed,
          label: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            hour12: true
          })
        };
      })
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return data;
  }
});

import { internal } from "./_generated/api";

/**
 * Create a subdomain (Admin only, bypasses Turnstile)
 */
export const createDomain = mutation({
  args: {
    subdomain: v.string(),
    rootDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    // Call internal claim logic directly
    await ctx.runMutation(internal.domainsInternal.claimInternal, {
      subdomain: args.subdomain,
      rootDomain: args.rootDomain ?? "doofs.tech",
      userId,
    });

    return { success: true };
  },
});

