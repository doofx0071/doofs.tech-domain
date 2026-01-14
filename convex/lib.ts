import { auth } from "./auth";

// Helper to ensure root domain exists and is active
export async function requireActivePlatformDomain(ctx: any, rootDomain: string) {
    const pd = await ctx.db
        .query("platform_domains")
        .withIndex("by_domain", (q: any) => q.eq("domain", rootDomain))
        .first();
    if (!pd || !pd.isActive) throw new Error("Root domain is not available.");
    return pd;
}

export async function requireUserId(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("User must be authenticated");
    return userId;
}

export async function requireAdmin(ctx: any) {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Admin access required");
    return { userId, user };
}

export function applySearch<T extends Record<string, any>>(
    items: T[],
    search: string | undefined,
    fields: (keyof T)[]
) {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((item) =>
        fields.some((f) => {
            const v = item[f];
            return typeof v === "string" && v.toLowerCase().includes(s);
        })
    );
}

export function now() {
    return Date.now();
}

export async function verifyTurnstile(token: string) {
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    
    // Allow explicit dev bypass only when TURNSTILE_DEV_BYPASS=true
    // This must be explicitly set - missing secret alone does NOT bypass
    if (process.env.TURNSTILE_DEV_BYPASS === "true") {
        console.warn("TURNSTILE_DEV_BYPASS is enabled - skipping Turnstile verification (Dev Mode Only)");
        return true;
    }
    
    if (!secret) {
        // Fail secure: if secret is not configured, reject the request
        // This prevents accidental bypass in production
        console.error("CLOUDFLARE_TURNSTILE_SECRET_KEY is not set. Turnstile verification cannot proceed.");
        throw new Error("CAPTCHA verification is not configured. Please contact the administrator.");
    }

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        body: formData,
        method: "POST",
    });

    const outcome = await result.json();
    if (!outcome.success) {
        console.error("Turnstile verification failed:", outcome);
    }
    return outcome.success;
}

/**
 * Check if platform is in maintenance mode
 * Throws error if in maintenance mode and user is not admin
 */
export async function checkMaintenanceMode(ctx: any) {
    const userId = await auth.getUserId(ctx);

    // Admins bypass maintenance mode
    if (userId) {
        const user = await ctx.db.get(userId);
        if (user?.role === "admin") {
            return;
        }
    }

    const settings = await ctx.db.query("platform_settings").first();
    if (settings?.maintenanceMode) {
        throw new Error(
            settings.maintenanceMessage ||
            "Platform is currently under maintenance. Please check back soon."
        );
    }
}

/**
 * Get platform settings or return defaults
 */
export async function getSettingsOrDefaults(ctx: any) {
    const settings = await ctx.db.query("platform_settings").first();

    if (!settings) {
        return {
            maintenanceMode: false,
            allowRegistrations: true,
            allowDomainCreation: true,
            maxDomainsPerUser: 10,
            maxDnsRecordsPerDomain: 50,
            maxDnsOperationsPerMinute: 30,
            maxApiRequestsPerMinute: 100,
            requireTurnstile: true,
            sessionTimeoutMinutes: 60,
            maxLoginAttempts: 5,
            mailgunEnabled: false,
            notifyAdminOnNewUser: false,
            notifyAdminOnNewDomain: false,
            defaultUserRole: "user" as "user" | "admin",
        };
    }

    return settings;
}

/**
 * Check if a user has reached their domain limit
 */
export async function checkDomainLimit(ctx: any, userId: string) {
    const settings = await getSettingsOrDefaults(ctx);
    const userDomains = await ctx.db
        .query("domains")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();

    if (userDomains.length >= settings.maxDomainsPerUser) {
        throw new Error(
            `You have reached the maximum limit of ${settings.maxDomainsPerUser} domains per user.`
        );
    }
}

/**
 * Check if a domain has reached its DNS record limit
 */
export async function checkDnsRecordLimit(ctx: any, domainId: string) {
    const settings = await getSettingsOrDefaults(ctx);
    const records = await ctx.db
        .query("dns_records")
        .withIndex("by_domain", (q: any) => q.eq("domainId", domainId))
        .collect();

    if (records.length >= settings.maxDnsRecordsPerDomain) {
        throw new Error(
            `This domain has reached the maximum limit of ${settings.maxDnsRecordsPerDomain} DNS records.`
        );
    }
}


// Rate limit logic has been moved to ./ratelimit.ts



