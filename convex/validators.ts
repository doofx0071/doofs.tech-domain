const SUBDOMAIN_RE = /^[a-z0-9-]+$/;
const RESERVED = new Set(["www", "mail", "admin", "support", "api", "docs", "cdn"]);

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
            // Basic IPv4 regex
            if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(c)) throw new Error("Invalid IPv4 address.");
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

export function computeFqdn(name: string, subdomain: string, rootDomain: string) {
    const n = name.trim().toLowerCase();
    const s = subdomain.trim().toLowerCase();
    const r = rootDomain.trim().toLowerCase();

    if (n === "@") {
        return `${s}.${r}`;
    }
    return `${n}.${s}.${r}`;
}
