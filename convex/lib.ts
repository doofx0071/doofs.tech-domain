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
    if (!secret) {
        console.warn("CLOUDFLARE_TURNSTILE_SECRET_KEY is not set. Skipping verification (Dev Mode).");
        return true; // Use strict check in prod
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
