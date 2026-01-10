import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./auth";

export const updateAvatar = mutation({
  args: {
    avatar: v.string(),
    avatarVariant: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    const oldAvatar = user?.avatar;

    await ctx.db.patch(userId, {
      avatar: args.avatar,
      avatarVariant: args.avatarVariant,
    });

    // Log the avatar change
    await ctx.db.insert("auditLogs", {
      userId,
      action: "avatar_changed",
      details: `Avatar updated from ${args.avatarVariant}`,
      metadata: {
        oldValue: oldAvatar,
        newValue: args.avatar,
      },
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    const oldName = user?.name;

    await ctx.db.patch(userId, {
      name: args.name,
    });

    // Log the profile update
    await ctx.db.insert("auditLogs", {
      userId,
      action: "profile_updated",
      details: "Profile name updated",
      metadata: {
        oldValue: oldName,
        newValue: args.name,
      },
      timestamp: Date.now(),
      status: "success",
    });

    return { success: true };
  },
});

export const updateLastLogin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    const isNewUser = !user?.lastLoginAt;

    await ctx.db.patch(userId, {
      lastLoginAt: Date.now(),
    });

    // Log the login
    await ctx.db.insert("auditLogs", {
      userId,
      action: isNewUser ? "first_login" : "login",
      details: isNewUser ? "User logged in for the first time" : "User logged in",
      timestamp: Date.now(),
      status: "success",
    });

    return { isNewUser };
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Get user data before deletion
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Archive the user data
    await ctx.db.insert("archived_users", {
      originalUserId: userId,
      name: user.name,
      image: user.image,
      email: user.email,
      emailVerificationTime: user.emailVerificationTime,
      phone: user.phone,
      phoneVerificationTime: user.phoneVerificationTime,
      isAnonymous: user.isAnonymous,
      avatar: user.avatar,
      avatarVariant: user.avatarVariant,
      lastLoginAt: user.lastLoginAt,
      role: user.role,
      archivedAt: Date.now(),
      archivedBy: userId,
      archiveReason: "User requested deletion",
    });

    // Log the archival action
    await ctx.db.insert("auditLogs", {
      userId: userId, // We keep the ID reference even if user is gone from users table
      action: "account_archived",
      details: "User account archived and removed from active users",
      metadata: {
        userAgent: "webapp",
      },
      timestamp: Date.now(),
      status: "success",
    });

    // Clean up auth accounts (prevents "ghost" accounts preventing new signups)
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    // Clean up active sessions
    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    // Delete the user from active users table
    await ctx.db.delete(userId);

    // Note: We deliberately do NOT delete the audit logs history as requested

    return { success: true };
  },
});
