import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireUserId, now } from "./lib";

// Initiate a domain transfer
export const initiateTransfer = mutation({
    args: {
        domainId: v.id("domains"),
        toEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const domain = await ctx.db.get(args.domainId);

        if (!domain) throw new Error("Domain not found");
        if (domain.userId !== userId) throw new Error("You do not own this domain");

        // Validate recipient email
        const toEmail = args.toEmail.trim().toLowerCase();
        if (toEmail === domain.ownerEmail?.toLowerCase()) {
            throw new Error("You cannot transfer a domain to yourself");
        }

        // Check for existing pending transfer
        const existing = await ctx.db
            .query("domain_transfers")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();

        if (existing) {
            throw new Error("A transfer is already pending for this domain. Cancel it first.");
        }

        // Generate 8-char secure code
        const transferCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const expiresAt = now() + (24 * 60 * 60 * 1000); // 24 hours

        const transferId = await ctx.db.insert("domain_transfers", {
            domainId: args.domainId,
            fromUserId: userId,
            toEmail,
            transferCode,
            status: "pending",
            createdAt: now(),
            expiresAt,
        });

        // Notify Sender
        await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
            userId,
            type: "success",
            title: "Transfer Initiated",
            message: `Transfer code generated for ${domain.subdomain}.${domain.rootDomain}. Code: ${transferCode}`,
            link: `/dashboard/domains`,
            domainId: args.domainId,
        });

        // Try to notify Recipient if they exist in our system
        const recipient = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", toEmail))
            .first();

        if (recipient) {
            await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
                userId: recipient._id,
                type: "info",
                title: "Incoming Domain Transfer",
                message: `${domain.ownerEmail} wants to transfer ${domain.subdomain}.${domain.rootDomain} to you. Click to claim.`,
                link: `/dashboard/domains?transferCode=${transferCode}`,
                domainId: args.domainId,
            });
        }

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "domain_transfer_initiated",
            details: `Initiated transfer of ${domain.subdomain}.${domain.rootDomain} to ${toEmail}`,
            timestamp: now(),
            status: "success",
        });

        return { transferId, transferCode };
    },
});

// Cancel a pending transfer
export const cancelTransfer = mutation({
    args: {
        transferId: v.id("domain_transfers"),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const transfer = await ctx.db.get(args.transferId);

        if (!transfer) throw new Error("Transfer not found");
        if (transfer.fromUserId !== userId) throw new Error("Unauthorized");
        if (transfer.status !== "pending") throw new Error("Transfer is not pending");

        await ctx.db.patch(args.transferId, { status: "cancelled" });

        const domain = await ctx.db.get(transfer.domainId);

        // Notify Recipient if they exist
        const recipient = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", transfer.toEmail))
            .first();

        if (recipient) {
            await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
                userId: recipient._id,
                type: "warning",
                title: "Transfer Cancelled",
                message: `The transfer of ${domain?.subdomain}.${domain?.rootDomain} has been cancelled by the sender.`,
                domainId: transfer.domainId,
            });
        }

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId,
            action: "domain_transfer_cancelled",
            details: `Cancelled transfer of ${domain?.subdomain}.${domain?.rootDomain}`,
            timestamp: now(),
            status: "success",
        });

        return { success: true };
    },
});

// Claim a transfer
export const claimTransfer = mutation({
    args: {
        transferCode: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const user = await ctx.db.get(userId);
        if (!user || !user.email) throw new Error("User email required");

        const transfer = await ctx.db
            .query("domain_transfers")
            .withIndex("by_code", (q) => q.eq("transferCode", args.transferCode))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();

        if (!transfer) throw new Error("Invalid or expired transfer code");

        if (transfer.expiresAt < now()) {
            await ctx.db.patch(transfer._id, { status: "expired" });
            throw new Error("Transfer code has expired");
        }

        // Verify recipient email matches logged in user
        if (transfer.toEmail.toLowerCase() !== user.email.toLowerCase()) {
            throw new Error(`This transfer is intended for ${transfer.toEmail}, but you are logged in as ${user.email}`);
        }

        const domain = await ctx.db.get(transfer.domainId);
        if (!domain) throw new Error("Domain not found");

        // Execute Transfer

        // 1. Update Transfer Record
        await ctx.db.patch(transfer._id, {
            status: "accepted",
            toUserId: userId,
            completedAt: now(),
        });

        // 2. Update Domain Ownership
        await ctx.db.patch(domain._id, {
            userId: userId,
            ownerEmail: user.email,
            updatedAt: now(),
        });

        // 3. Update DNS Records Ownership
        const dnsRecords = await ctx.db
            .query("dns_records")
            .withIndex("by_domain", (q) => q.eq("domainId", domain._id))
            .collect();

        for (const record of dnsRecords) {
            await ctx.db.patch(record._id, { userId: userId });
        }

        // 4. Notifications
        // Notify Sender
        await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
            userId: transfer.fromUserId,
            type: "success",
            title: "Transfer Completed",
            message: `${domain.subdomain}.${domain.rootDomain} has been successfully transferred to ${user.email}.`,
            link: `/dashboard/domains`,
        });

        // Notify Recipient
        await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
            userId,
            type: "success",
            title: "Domain Received",
            message: `You are now the owner of ${domain.subdomain}.${domain.rootDomain}.`,
            link: `/dashboard/domains`,
            domainId: domain._id,
        });

        // 5. Audit Logs
        await ctx.db.insert("auditLogs", {
            userId,
            action: "domain_transfer_claimed",
            details: `Claimed ownership of ${domain.subdomain}.${domain.rootDomain} from ${transfer.fromUserId}`,
            timestamp: now(),
            status: "success",
        });

        return { success: true, domainId: domain._id };
    },
});

// List outgoing pending transfers for the current user
export const getMyTransfers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);

        const transfers = await ctx.db
            .query("domain_transfers")
            .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
            .order("desc") // Newest first
            .take(20);

        // Enhance with domain name
        const enhancedTransfers = await Promise.all(transfers.map(async (t) => {
            const domain = await ctx.db.get(t.domainId);
            return {
                ...t,
                domainName: domain ? `${domain.subdomain}.${domain.rootDomain}` : "Unknown Domain"
            };
        }));

        return enhancedTransfers;
    }
});

// Lookup info about a transfer code (for preview before claiming)
export const getTransferInfo = query({
    args: { transferCode: v.string() },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx); // Require login to view

        const transfer = await ctx.db
            .query("domain_transfers")
            .withIndex("by_code", (q) => q.eq("transferCode", args.transferCode))
            .first(); // Allow fetching non-pending for status check

        if (!transfer) return null;

        const domain = await ctx.db.get(transfer.domainId);

        return {
            toEmail: transfer.toEmail,
            domainName: domain ? `${domain.subdomain}.${domain.rootDomain}` : "Unknown Domain",
            expiresAt: transfer.expiresAt,
            isValid: transfer.status === "pending" && transfer.expiresAt > now(),
            status: transfer.status, // Return status for UI handling
        };
    }
});

// Check if there is a pending transfer for a specific domain
export const getPendingForDomain = query({
    args: { domainId: v.id("domains") },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        // Verify ownership (optional, but good for privacy)
        const domain = await ctx.db.get(args.domainId);
        if (domain && domain.userId !== userId) return null;

        return await ctx.db
            .query("domain_transfers")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();
    }
});

// Cron job to expire old transfers
export const expirePendingTransfers = internalMutation({
    args: {},
    handler: async (ctx) => {
        const nowMs = now();

        // Find pending transfers that have expired
        // Note: This could be optimized with a dedicated index if volume is high
        const pendingTransfers = await ctx.db
            .query("domain_transfers")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        let expiredCount = 0;

        for (const transfer of pendingTransfers) {
            if (transfer.expiresAt < nowMs) {
                await ctx.db.patch(transfer._id, { status: "expired" });

                // Notify Sender
                await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
                    userId: transfer.fromUserId,
                    type: "warning",
                    title: "Transfer Expired",
                    message: `The transfer for ${transfer.toEmail} has expired and was cancelled.`,
                });

                // Audit log
                const domain = await ctx.db.get(transfer.domainId);
                await ctx.db.insert("auditLogs", {
                    userId: transfer.fromUserId,
                    action: "domain_transfer_expired",
                    details: `Transfer of ${domain ? `${domain.subdomain}.${domain.rootDomain}` : "unknown domain"} to ${transfer.toEmail} expired`,
                    timestamp: nowMs,
                    status: "success",
                });

                expiredCount++;
            }
        }

        console.log(`Expired ${expiredCount} domain transfers.`);
    }
});
