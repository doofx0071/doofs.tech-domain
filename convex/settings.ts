/**
 * Platform Settings Management
 * Admin-only functions to manage platform-wide configuration
 */

import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { auth } from "./auth";

/**
 * Default platform settings
 */
const DEFAULT_SETTINGS = {
    // General Settings
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
    allowRegistrations: true,
    allowDomainCreation: true,

    // Rate Limiting
    maxDomainsPerUser: 10,
    maxDnsRecordsPerDomain: 50,
    maxDnsOperationsPerMinute: 30,
    maxApiRequestsPerMinute: 100,

    // Email Configuration
    mailgunDomain: undefined,
    mailgunEnabled: false,
    notifyAdminOnNewUser: false,
    notifyAdminOnNewDomain: false,

    // Security
    requireTurnstile: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,

    // User Management
    maxTotalUsers: undefined,
    defaultUserRole: "user" as "user" | "admin",
};

/**
 * Get current platform settings (admin only)
 */
export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const settings = await ctx.db.query("platform_settings").first();

        if (!settings) {
            // Return defaults if no settings exist yet
            return DEFAULT_SETTINGS;
        }

        return settings;
    },
});

/**
 * Get public settings (non-admin users)
 * Only returns settings that affect public-facing behavior
 */
export const getPublicSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("platform_settings").first();

        if (!settings) {
            return {
                maintenanceMode: DEFAULT_SETTINGS.maintenanceMode,
                maintenanceMessage: DEFAULT_SETTINGS.maintenanceMessage,
                allowRegistrations: DEFAULT_SETTINGS.allowRegistrations,
            };
        }

        return {
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            allowRegistrations: settings.allowRegistrations,
        };
    },
});

/**
 * Update platform settings (admin only)
 */
export const updateSettings = mutation({
    args: {
        // General Settings
        maintenanceMode: v.optional(v.boolean()),
        maintenanceMessage: v.optional(v.string()),
        allowRegistrations: v.optional(v.boolean()),
        allowDomainCreation: v.optional(v.boolean()),

        // Rate Limiting
        maxDomainsPerUser: v.optional(v.number()),
        maxDnsRecordsPerDomain: v.optional(v.number()),
        maxDnsOperationsPerMinute: v.optional(v.number()),
        maxApiRequestsPerMinute: v.optional(v.number()),

        // Email Configuration
        mailgunDomain: v.optional(v.string()),
        mailgunEnabled: v.optional(v.boolean()),
        notifyAdminOnNewUser: v.optional(v.boolean()),
        notifyAdminOnNewDomain: v.optional(v.boolean()),

        // Security
        requireTurnstile: v.optional(v.boolean()),
        sessionTimeoutMinutes: v.optional(v.number()),
        maxLoginAttempts: v.optional(v.number()),

        // User Management
        maxTotalUsers: v.optional(v.number()),
        defaultUserRole: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireAdmin(ctx);

        // Get or create settings
        let settings = await ctx.db.query("platform_settings").first();

        const updateData = {
            ...args,
            updatedAt: Date.now(),
            updatedBy: userId,
        };

        // Remove undefined values
        Object.keys(updateData).forEach((key) => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        let settingsId;
        if (settings) {
            // Update existing settings
            await ctx.db.patch(settings._id, updateData);
            settingsId = settings._id;
        } else {
            // Create new settings with defaults and overrides
            settingsId = await ctx.db.insert("platform_settings", {
                ...DEFAULT_SETTINGS,
                ...updateData,
                updatedAt: Date.now(),
                updatedBy: userId,
            });
        }

        // Create audit log
        const changedFields = Object.keys(args).filter(
            (key) => args[key as keyof typeof args] !== undefined
        );

        await ctx.db.insert("auditLogs", {
            userId,
            action: "settings_updated",
            details: `Updated platform settings: ${changedFields.join(", ")}`,
            metadata: {
                oldValue: settings ? JSON.stringify(settings) : "defaults",
                newValue: JSON.stringify(updateData),
            },
            timestamp: Date.now(),
            status: "success",
        });

        return { success: true, settingsId };
    },
});

/**
 * Initialize settings with defaults (internal, called on first access if needed)
 */
export const initializeSettings = internalMutation({
    args: {
        adminUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("platform_settings").first();
        if (existing) {
            return existing._id;
        }

        const settingsId = await ctx.db.insert("platform_settings", {
            ...DEFAULT_SETTINGS,
            updatedAt: Date.now(),
            updatedBy: args.adminUserId,
        });

        return settingsId;
    },
});

/**
 * Helper query to check if registrations are allowed
 */
export const canRegister = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("platform_settings").first();
        return settings?.allowRegistrations ?? DEFAULT_SETTINGS.allowRegistrations;
    },
});

/**
 * Helper query to check if domain creation is allowed
 */
export const canCreateDomain = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return false;

        const settings = await ctx.db.query("platform_settings").first();
        return settings?.allowDomainCreation ?? DEFAULT_SETTINGS.allowDomainCreation;
    },
});

/**
 * Helper query to check maintenance mode
 */
export const isMaintenanceMode = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);

        // Admins bypass maintenance mode
        if (userId) {
            const user = await ctx.db.get(userId);
            if (user?.role === "admin") {
                return false;
            }
        }

        const settings = await ctx.db.query("platform_settings").first();
        return settings?.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode;
    },
});
