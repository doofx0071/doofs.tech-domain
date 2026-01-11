import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Extend authTables to include avatar field in users table
const schema = defineSchema({
  ...authTables,
  // Extend users table with avatar field
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom field for avatar variant/seed
    avatar: v.optional(v.string()),
    avatarVariant: v.optional(v.string()),
    // Track last login for welcome message
    lastLoginAt: v.optional(v.number()),
    // Onboarding status
    hasCompletedOnboarding: v.optional(v.boolean()),
    // Role-based access control
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    // Account status (for suspend/ban)
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("banned")
    )),
    statusReason: v.optional(v.string()),
    statusUpdatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  // Audit logs table for tracking all user activities
  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(), // e.g., "profile_updated", "avatar_changed", "login", "first_login"
    details: v.optional(v.string()), // Additional context about the action
    metadata: v.optional(v.object({
      oldValue: v.optional(v.string()),
      newValue: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
    timestamp: v.number(),
    status: v.string(), // "success" or "failed"
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),

  // Archived users table for soft deletes
  archived_users: defineTable({
    originalUserId: v.string(), // We store as string since the ID is no longer valid in users table
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    avatar: v.optional(v.string()),
    avatarVariant: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    // Archival metadata
    archivedAt: v.number(),
    archivedBy: v.string(), // User ID who performed the action
    archiveReason: v.optional(v.string()),
  }).index("by_original_user_id", ["originalUserId"]),

  // Platform Root Domains (e.g., doofs.tech, norlaxx.com) available for clients
  platform_domains: defineTable({
    domain: v.string(), // e.g. "norlaxx.com"
    description: v.optional(v.string()), // e.g. "Premium Domain"
    isActive: v.boolean(),

    // Cloudflare Metadata
    zoneId: v.optional(v.string()),
    nameservers: v.optional(v.array(v.string())),
    cloudflareStatus: v.optional(v.string()), // active, pending, moved, etc.
    updatedAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_domain", ["domain"]),

  // Subdomains created by users on platform domains
  domains: defineTable({
    subdomain: v.string(), // "myproject"
    rootDomain: v.string(), // "norlaxx.com"
    userId: v.optional(v.id("users")),
    ownerEmail: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subdomain", ["subdomain"])
    .index("by_root_domain", ["rootDomain"])
    .index("by_full_domain", ["rootDomain", "subdomain"]) // Uniqueness check
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .searchIndex("search_subdomain", { searchField: "subdomain" }),

  // DNS Records (Managed by users, synced to Cloudflare)
  dns_records: defineTable({
    domainId: v.id("domains"),
    userId: v.id("users"), // Denormalized owner
    rootDomain: v.string(),
    subdomain: v.string(),
    type: v.union(v.literal("A"), v.literal("AAAA"), v.literal("CNAME"), v.literal("TXT"), v.literal("MX")),
    name: v.string(), // relative, "@" or "api"
    fqdn: v.string(), // computed full name
    content: v.string(),
    priority: v.optional(v.number()),
    ttl: v.optional(v.number()),
    provider: v.optional(v.literal("cloudflare")),
    providerRecordId: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("error"), v.literal("deleting")),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_domain", ["domainId"])
    .index("by_user", ["userId"])
    .index("by_fqdn", ["fqdn"])
    .index("by_domain_type_name", ["domainId", "type", "name"]),

  // DNS Jobs (Async queue for Cloudflare operations)
  dns_jobs: defineTable({
    jobType: v.union(v.literal("UPSERT_RECORD"), v.literal("DELETE_RECORD"), v.literal("REBUILD_DOMAIN")),
    domainId: v.id("domains"),
    recordId: v.optional(v.id("dns_records")),
    status: v.union(v.literal("queued"), v.literal("running"), v.literal("success"), v.literal("failed"), v.literal("retrying")),
    attempts: v.number(),
    nextRunAt: v.optional(v.number()),
    error: v.optional(v.string()),
    idempotencyKey: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_nextRunAt", ["nextRunAt"])
    .index("by_domain", ["domainId"]),

  // Contact Messages
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    userId: v.optional(v.id("users")), // If authenticated
    status: v.union(v.literal("unread"), v.literal("read"), v.literal("replied")),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Rate Limits (Optional but recommended)
  rate_limits: defineTable({
    userId: v.id("users"),
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_key", ["userId", "key"]),

  // Platform Settings (Admin-controlled global configuration)
  platform_settings: defineTable({
    // General Settings
    maintenanceMode: v.boolean(),
    maintenanceMessage: v.optional(v.string()),
    allowRegistrations: v.boolean(),
    allowDomainCreation: v.boolean(),

    // Rate Limiting
    maxDomainsPerUser: v.number(),
    maxDnsRecordsPerDomain: v.number(),
    maxDnsOperationsPerMinute: v.number(),
    maxApiRequestsPerMinute: v.number(),

    // Email Configuration
    mailgunDomain: v.optional(v.string()),
    mailgunEnabled: v.boolean(),
    notifyAdminOnNewUser: v.boolean(),
    notifyAdminOnNewDomain: v.boolean(),

    // Security
    requireTurnstile: v.boolean(),
    sessionTimeoutMinutes: v.number(),
    maxLoginAttempts: v.number(),

    // User Management
    maxTotalUsers: v.optional(v.number()),
    defaultUserRole: v.union(v.literal("admin"), v.literal("user")),

    // Metadata
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  }),
});

export default schema;
