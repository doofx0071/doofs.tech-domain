const SUBDOMAIN_RE = /^[a-z0-9-]+$/;
const RESERVED = new Set([
    // System & Auth
    "admin", "administrator", "api", "app", "auth", "beta", "cache", "cdn", "code", "config", "console",
    "dashboard", "data", "database", "db", "dev", "developer", "developers", "docs", "documentation",
    "files", "git", "graphql", "host", "internal", "local", "localhost", "login", "logout", "logs",
    "manage", "management", "monitor", "oauth", "ops", "panel", "portal", "prod", "production",
    "profile", "public", "register", "registration", "remote", "rest", "root", "search", "secure",
    "server", "service", "services", "setting", "settings", "signin", "signup", "site", "source",
    "stage", "staging", "static", "stats", "status", "sys", "system", "test", "tests", "tmp",
    "tool", "tools", "update", "updates", "upload", "user", "users", "v1", "v2", "video", "videos",
    "vpn", "web", "www", "xml",

    // Infrastructure & Email
    "ftp", "imap", "mail", "mailgun", "mx", "ns", "ns1", "ns2", "ns3", "ns4", "pop", "pop3", "smtp",
    "ssl", "tls", "webmail",

    // Business & Platform
    "about", "account", "billing", "blog", "careers", "community", "contact", "enterprise", "faq",
    "features", "forum", "help", "home", "info", "invite", "job", "jobs", "join", "legal", "live",
    "marketing", "news", "page", "pages", "payment", "payments", "plans", "pricing", "privacy",
    "product", "sales", "shop", "store", "support", "team", "terms",

    // Brand/Project Protection
    "doofs", "convex", "vercel", "github", "netlify", "cloudflare", "aws", "azure", "google",

    // Generic
    "demo", "example", "none", "null", "undefined", "void"
]);

export function validateSubdomainLabel(label: string) {
    const s = label.trim().toLowerCase();
    if (s.length < 3 || s.length > 32) throw new Error("Subdomain must be 3–32 chars.");
    if (!SUBDOMAIN_RE.test(s)) throw new Error("Use lowercase letters, numbers, hyphens only.");
    if (s.startsWith("-") || s.endsWith("-")) throw new Error("Subdomain cannot start/end with '-'.");
    if (RESERVED.has(s)) throw new Error("That subdomain is reserved.");
    return s;
}

export function validateDnsName(name: string) {
    const s = name.trim().toLowerCase();

    // Allow @ as strict exact match
    if (s === "@") return "@";

    // Otherwise, strict relative name rules
    if (s.length > 63) throw new Error("DNS name segment too long.");
    if (!SUBDOMAIN_RE.test(s)) throw new Error("Invalid DNS name format.");
    if (s.startsWith("-") || s.endsWith("-")) throw new Error("DNS name cannot start/end with '-'.");

    return s;
}

export function validateRecordContent(type: string, content: string) {
    const c = content.trim();
    if (!c) throw new Error("Content cannot be empty.");

    switch (type) {
        case "A":
            // Validate IPv4 address format and octet ranges (0-255)
            if (!isValidIPv4(c)) throw new Error("Invalid IPv4 address.");
            break;
        case "AAAA":
            // Basic check for colon to detect IPv6 roughly
            if (!c.includes(":")) throw new Error("Invalid IPv6 address.");
            break;
        case "CNAME":
            // Should be a hostname
            if (c.includes("://") || c.includes("/")) throw new Error("CNAME must be a hostname, not a URL.");
            break;
        case "TXT":
            if (c.length > 2048) throw new Error("TXT record too long.");
            break;
        case "MX":
            // Basic hostname check
            if (!c.includes(".") && c !== "@") throw new Error("MX content should be a hostname");
            break;
        default:
            break;
    }
    return c;
}

/**
 * Validate IPv4 address format and range
 * Each octet must be 0-255
 */
function isValidIPv4(ip: string): boolean {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    
    for (const part of parts) {
        // Check that part is a valid number (no leading zeros except for "0" itself)
        if (!/^\d+$/.test(part)) return false;
        if (part.length > 1 && part.startsWith("0")) return false; // No leading zeros
        
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) return false;
    }
    
    return true;
}

export function computeFqdn(name: string, subdomain: string, rootDomain: string) {
    const n = name.trim().toLowerCase();
    const s = subdomain.trim().toLowerCase();
    const r = rootDomain.trim().toLowerCase();

    if (n === "@") {
        return `${s}.${r}`;
    }
    return `${n}.${s}.${r}`;
}

/**
 * Validate platform settings updates
 */
export function validateSettingsUpdate(updates: Record<string, any>) {
    // Validate rate limiting values
    if (updates.maxDomainsPerUser !== undefined) {
        const val = updates.maxDomainsPerUser;
        if (typeof val !== "number" || val < 1 || val > 1000) {
            throw new Error("maxDomainsPerUser must be between 1 and 1000");
        }
    }

    if (updates.maxDnsRecordsPerDomain !== undefined) {
        const val = updates.maxDnsRecordsPerDomain;
        if (typeof val !== "number" || val < 1 || val > 500) {
            throw new Error("maxDnsRecordsPerDomain must be between 1 and 500");
        }
    }

    if (updates.maxDnsOperationsPerMinute !== undefined) {
        const val = updates.maxDnsOperationsPerMinute;
        if (typeof val !== "number" || val < 1 || val > 1000) {
            throw new Error("maxDnsOperationsPerMinute must be between 1 and 1000");
        }
    }

    if (updates.maxApiRequestsPerMinute !== undefined) {
        const val = updates.maxApiRequestsPerMinute;
        if (typeof val !== "number" || val < 10 || val > 10000) {
            throw new Error("maxApiRequestsPerMinute must be between 10 and 10000");
        }
    }

    // Validate security settings
    if (updates.sessionTimeoutMinutes !== undefined) {
        const val = updates.sessionTimeoutMinutes;
        if (typeof val !== "number" || val < 5 || val > 43200) { // 5 min to 30 days
            throw new Error("sessionTimeoutMinutes must be between 5 and 43200 (30 days)");
        }
    }

    if (updates.maxLoginAttempts !== undefined) {
        const val = updates.maxLoginAttempts;
        if (typeof val !== "number" || val < 3 || val > 20) {
            throw new Error("maxLoginAttempts must be between 3 and 20");
        }
    }

    // Validate user limits
    if (updates.maxTotalUsers !== undefined && updates.maxTotalUsers !== null) {
        const val = updates.maxTotalUsers;
        if (typeof val !== "number" || val < 1) {
            throw new Error("maxTotalUsers must be at least 1");
        }
    }

    // Validate Mailgun domain format
    if (updates.mailgunDomain !== undefined && updates.mailgunDomain !== null) {
        const domain = updates.mailgunDomain.trim();
        if (domain && !domain.includes(".")) {
            throw new Error("Invalid Mailgun domain format");
        }
    }

    if (updates.mailgunFromEmail !== undefined) {
        const email = updates.mailgunFromEmail.trim();
        if (email && !email.includes("@")) {
            throw new Error("Invalid 'From Email' format");
        }
    }

    if (updates.mailgunFromName !== undefined) {
        const name = updates.mailgunFromName.trim();
        if (name.length > 50) {
            throw new Error("'From Name' must be under 50 characters");
        }
    }

    return true;
}

