import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { auth } from "./auth";
import { requireUserId, applySearch, now, verifyTurnstile, requireActivePlatformDomain, checkDomainLimit, getSettingsOrDefaults } from "./lib";
import { validateSubdomainLabel } from "./validators";


// Public check for availability
export const checkAvailability = query({
    args: {
        subdomain: v.string(),
        rootDomain: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const rootDomain = (args.rootDomain ?? "doofs.tech").toLowerCase();

        // Validate format and reserved words
        try {
            validateSubdomainLabel(args.subdomain);
        } catch (e: any) {
            const msg = e.message || "Invalid";
            if (msg.includes("reserved")) return { available: false, reason: "Reserved" };
            return { available: false, reason: "Invalid format" };
        }

        const pd = await ctx.db
            .query("platform_domains")
            .withIndex("by_domain", (q: any) => q.eq("domain", rootDomain))
            .first();

        // Return unavailable if root domain is closed, unless we want to be more specific
        if (!pd || !pd.isActive) return { available: false, reason: "Root domain unavailable" };

        const existing = await ctx.db
            .query("domains")
            .withIndex("by_full_domain", (q) => q.eq("rootDomain", rootDomain).eq("subdomain", args.subdomain))
            .first();

        if (existing) return { available: false };

        return { available: true };
    }
});

export const listMine = query({
    args: { search: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const items = await ctx.db
            .query("domains")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Enrich with platform domain SSL status (zone-level)
        const enrichedItems = await Promise.all(items.map(async (domain) => {
            const platformDomain = await ctx.db
                .query("platform_domains")
                .withIndex("by_domain", (q) => q.eq("domain", domain.rootDomain))
                .first();

            const status = platformDomain?.sslStatus || "none";

            return {
                ...domain,
                sslStatus: status === "pending_validation" ? "pending" : status,
                sslExpiresAt: platformDomain?.sslExpiresAt,
            };
        }));

        return applySearch(enrichedItems, args.search, ["subdomain", "rootDomain", "ownerEmail"]);
    },
});

export const claim = action({
    args: {
        subdomain: v.string(),
        rootDomain: v.optional(v.string()), // default doofs.tech
        token: v.string(),
    },
    handler: async (ctx, args): Promise<any> => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const isValid = await verifyTurnstile(args.token);
        if (!isValid) throw new Error("Turnstile validation failed. Please try again.");

        const result = await ctx.runMutation(internal.domainsInternal.claimInternal, {
            subdomain: args.subdomain,
            rootDomain: args.rootDomain ?? "doofs.tech",
            userId,
        });

        // Notify Admin
        await ctx.runAction(internal.emailService.notifyAdmin, {
            subject: "New Domain Claimed",
            message: `User ${userId} has claimed the domain: ${args.subdomain}.${args.rootDomain ?? "doofs.tech"}`
        });

        // Notify User
        const user = await ctx.runQuery(api.users.currentUser);
        if (user && user.email) {
            await ctx.runAction(internal.emailService.sendDomainClaimedEmail, {
                email: user.email,
                subdomain: args.subdomain,
                rootDomain: args.rootDomain ?? "doofs.tech",
            });
        }

        return result;
    },
});

// Verify domain ownership by checking TXT record
export const verifyDomain = action({
    args: { domainId: v.id("domains") },
    handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Get domain
        const domain = await ctx.runQuery(internal.domainsInternal.getInternal, {
            domainId: args.domainId,
            userId,
        });

        if (!domain) throw new Error("Domain not found or not authorized");
        if (domain.status === "active") {
            return { success: true, message: "Domain already verified" };
        }
        if (!domain.verificationCode) {
            throw new Error("No verification code found for this domain");
        }

        // Lookup TXT record at _doofs-verify.subdomain.rootDomain
        const verificationHostname = `_doofs-verify.${domain.subdomain}.${domain.rootDomain}`;
        const dnsResult = await ctx.runAction(internal.dnsProvider.cloudflare.lookupTXTRecord, {
            hostname: verificationHostname,
        });

        // Check if any TXT record matches the verification code
        const codeMatch = dnsResult.records.some(
            (record: string) => record === domain.verificationCode
        );

        if (!codeMatch) {
            return {
                success: false,
                message: `TXT record not found. Add: ${verificationHostname} TXT "${domain.verificationCode}"`,
            };
        }

        // Verification successful - activate domain
        await ctx.runMutation(internal.domainsInternal.activateDomain, {
            domainId: args.domainId,
        });

        return { success: true, message: "Domain verified successfully!" };
    },
});

// Check SSL status for a domain (updates zone status)
export const checkSSLStatus = action({
    args: { domainId: v.id("domains") },
    handler: async (ctx, args): Promise<{ sslStatus: string; message: string }> => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Get domain
        const domain = await ctx.runQuery(internal.domainsInternal.getInternal, {
            domainId: args.domainId,
            userId,
        });

        if (!domain) throw new Error("Domain not found or not authorized");

        // Get platform domain
        const platformDomains = await ctx.runQuery(api.platformDomains.listPublic, {});
        const platformDomain = platformDomains.find((pd: any) => pd.domain === domain.rootDomain);

        if (!platformDomain?.zoneId) {
            return { sslStatus: "none", message: "No zone configured" };
        }

        // Trigger zone-level SSL check
        const result = await ctx.runAction(internal.platformDomains.checkSSL, {
            id: platformDomain._id,
        });

        // Map pending_validation to pending for frontend compatibility if needed, 
        // or just pass through. Frontend expects "pending" or "active".
        const status = result.sslStatus === "pending_validation" ? "pending" : result.sslStatus;

        return {
            sslStatus: status,
            message: status === "active" ? "SSL is active" : `SSL status: ${status}`
        };
    },
});

export const remove = action({
    args: { id: v.id("domains") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Get domain and records info first
        const domain = await ctx.runQuery(internal.domainsInternal.getDomainWithRecords, {
            domainId: args.id,
            userId,
        });

        if (!domain) throw new Error("Domain not found or not authorized");

        // Delete each record from Cloudflare
        const cfToken = process.env.CLOUDFLARE_API_TOKEN;
        if (cfToken && domain.zoneId) {
            for (const record of domain.records) {
                if (record.providerRecordId) {
                    try {
                        const resp = await fetch(
                            `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}/dns_records/${record.providerRecordId}`,
                            {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${cfToken}`,
                                    "Content-Type": "application/json",
                                },
                            }
                        );
                        const data = await resp.json();
                        if (!data.success) {
                            const isNotFound = data.errors?.some((e: any) => e.code === 81044 || e.code === 1001);
                            if (!isNotFound) {
                                console.warn(`Failed to delete CF record ${record.providerRecordId}:`, data.errors);
                            }
                        }
                    } catch (e) {
                        console.warn(`Error deleting CF record ${record.providerRecordId}:`, e);
                    }
                }
            }
        }

        // Now delete from database
        await ctx.runMutation(internal.domainsInternal.removeInternal, {
            domainId: args.id,
            userId,
        });
    },
});
// Helper for other internal modules to assert ownership (or admin access)
export async function assertDomainOwner(ctx: any, domainId: any) {
    const userId = await requireUserId(ctx);
    const domain = await ctx.db.get(domainId);
    if (!domain) throw new Error("Domain not found");

    if (domain.userId !== userId) {
        // Allow admins to bypass ownership check
        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") {
            throw new Error("Not authorized for this domain");
        }
    }
    return domain;
}
