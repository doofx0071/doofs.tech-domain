import { Server, Mail, Gamepad2, Globe, FileText, Cloud } from "lucide-react";

export type TutorialCategory = 'hosting' | 'email' | 'gaming' | 'docs' | 'other';
export type DnsRecordType = 'A' | 'CNAME' | 'MX' | 'TXT' | 'SRV';

export interface DnsRecord {
    type: DnsRecordType;
    name: string;
    value: string;
    priority?: number;
    weight?: number; // For SRV
    port?: number;   // For SRV
    target?: string; // For SRV target, mapped to value usually but explicit here
    ttl?: string;
}

export interface TutorialStep {
    title: string;
    description: string;
}

export interface Tutorial {
    id: string;
    title: string;
    icon: any;
    category: TutorialCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    officialDocsUrl?: string;
    dnsRecords: DnsRecord[];
    steps: TutorialStep[];
}

export const tutorialCategories = [
    { id: 'all', label: 'All' },
    { id: 'hosting', label: 'Web Hosting', icon: Cloud },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'docs', label: 'Docs & Blogs', icon: FileText },
];

export const tutorials: Tutorial[] = [
    // --- WEB HOSTING ---
    {
        id: "vercel",
        title: "Vercel",
        icon: Globe,
        category: "hosting",
        difficulty: "easy",
        description: "Deploy Next.js, React, and frontend apps with zero config.",
        officialDocsUrl: "https://vercel.com/docs/domaims",
        dnsRecords: [
            { type: "CNAME", name: "@", value: "cname.vercel-dns.com", ttl: "Auto" },
            { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "Auto" }
        ],
        steps: [
            { title: "Add Domain in Vercel", description: "Go to Project Settings > Domains and enter your doofs.tech subdomain." },
            { title: "Configure DNS", description: "Add the CNAME record below in your doofs.tech dashboard." },
            { title: "Verify", description: "Vercel will automatically verify the domain within a few minutes." }
        ]
    },
    {
        id: "netlify",
        title: "Netlify",
        icon: Cloud,
        category: "hosting",
        difficulty: "easy",
        description: "Fast hosting for static sites and JAMstack applications.",
        officialDocsUrl: "https://docs.netlify.com/domains-https/custom-domains/",
        dnsRecords: [
            { type: "CNAME", name: "@", value: "[your-site].netlify.app", ttl: "Auto" },
            { type: "CNAME", name: "www", value: "[your-site].netlify.app", ttl: "Auto" }
        ],
        steps: [
            { title: "Find your Netlify URL", description: "Look for your site URL ending in .netlify.app (e.g., my-site.netlify.app)." },
            { title: "Add Custom Domain", description: "In Netlify: Site Settings > Domain Management > Add custom domain." },
            { title: "Add CNAME Record", description: "Point your subdomain to your Netlify app URL using a CNAME record." }
        ]
    },
    {
        id: "github-pages",
        title: "GitHub Pages",
        icon: Globe,
        category: "hosting",
        difficulty: "medium",
        description: "Host static websites directly from your GitHub repository.",
        officialDocsUrl: "https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site",
        dnsRecords: [
            { type: "CNAME", name: "@", value: "[username].github.io", ttl: "Auto" },
            { type: "CNAME", name: "www", value: "[username].github.io", ttl: "Auto" }
        ],
        steps: [
            { title: "Configure Repository", description: "Go to Repo Settings > Pages > Custom domain. Enter your doofs.tech domain." },
            { title: "DNS Setup", description: "Add a CNAME record pointing to your username.github.io address." },
            { title: "Enforce HTTPS", description: "Once verified, check the 'Enforce HTTPS' box in GitHub settings." }
        ]
    },
    {
        id: "render",
        title: "Render",
        icon: Server,
        category: "hosting",
        difficulty: "easy",
        description: "Unified cloud to build and run all your apps and websites.",
        officialDocsUrl: "https://render.com/docs/custom-domains",
        dnsRecords: [
            { type: "CNAME", name: "@", value: "[app-name].onrender.com", ttl: "Auto" }
        ],
        steps: [
            { title: "Add Custom Domain", description: "In Render Dashboard, go to Settings > Custom Domains and add your domain." },
            { title: "Update DNS", description: "Add the CNAME record to point to your Render app URL." },
            { title: "Verification", description: "Render will automatically provision SSL once DNS propagates." }
        ]
    },

    // --- EMAIL SERVICES ---
    {
        id: "improvmx",
        title: "ImprovMX",
        icon: Mail,
        category: "email",
        difficulty: "easy",
        description: "Free email forwarding (e.g., you@yourdomain.com -> you@gmail.com).",
        officialDocsUrl: "https://improvmx.com/guides/",
        dnsRecords: [
            { type: "MX", name: "@", value: "mx1.improvmx.com", priority: 10, ttl: "3600" },
            { type: "MX", name: "@", value: "mx2.improvmx.com", priority: 20, ttl: "3600" },
            { type: "TXT", name: "@", value: "v=spf1 include:spf.improvmx.com ~all", ttl: "3600" }
        ],
        steps: [
            { title: "Create Alias", description: "Sign up at ImprovMX and enter your domain and destination email." },
            { title: "Set MX Records", description: "Add the two MX records shown below to route emails to ImprovMX." },
            { title: "Add SPF Record", description: "Add the TXT record to authorize ImprovMX to send/forward emails (optional but recommended)." }
        ]
    },
    {
        id: "forwardemail",
        title: "ForwardEmail",
        icon: Mail,
        category: "email",
        difficulty: "medium",
        description: "Open-source, privacy-focused email forwarding service.",
        officialDocsUrl: "https://forwardemail.net/en/faq#how-to-setup-dns-records",
        dnsRecords: [
            { type: "MX", name: "@", value: "mx1.forwardemail.net", priority: 10, ttl: "3600" },
            { type: "MX", name: "@", value: "mx2.forwardemail.net", priority: 20, ttl: "3600" },
            { type: "TXT", name: "@", value: "v=spf1 a mx include:spf.forwardemail.net ~all", ttl: "3600" }
        ],
        steps: [
            { title: "Register Domain", description: "Add your domain on ForwardEmail.net." },
            { title: "Configure DNS", description: "Add the MX and TXT records as shown." },
            { title: "Verify", description: "Wait for DNS propagation. ForwardEmail will verify automatically." }
        ]
    },
    {
        id: "mailgun",
        title: "Mailgun",
        icon: Mail,
        category: "email",
        difficulty: "hard",
        description: "Powerful API for transactional emails. Great for developers.",
        officialDocsUrl: "https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain",
        dnsRecords: [
            { type: "MX", name: "@", value: "mxa.mailgun.org", priority: 10, ttl: "3600" },
            { type: "MX", name: "@", value: "mxb.mailgun.org", priority: 10, ttl: "3600" },
            { type: "TXT", name: "@", value: "v=spf1 include:mailgun.org ~all", ttl: "3600" }
            // Note: DKIM is usually unique per domain, so we might note that in description
        ],
        steps: [
            { title: "Add Domain to Mailgun", description: "In Mailgun dashboard, add your custom domain." },
            { title: "Add MX & SPF", description: "Add the MX and SPF records shown below." },
            { title: "Add DKIM (Important)", description: "Mailgun will provide a unique DKIM key (TXT record) in their dashboard. You MUST add that too for deliverability." }
        ]
    },

    // --- GAMING ---
    {
        id: "minecraft-java",
        title: "Minecraft (Java)",
        icon: Gamepad2,
        category: "gaming",
        difficulty: "hard",
        description: "Connect your custom domain to your Minecraft Java Edition server.",
        officialDocsUrl: "https://minecraft.wiki/w/Tutorials/Setting_up_a_server#DNS_records_2",
        dnsRecords: [
            { type: "A", name: "play", value: "[server-ip]", ttl: "3600" },
            { type: "SRV", name: "_minecraft._tcp.play", value: "0 5 25565 play.[domain]", priority: 0, weight: 5, port: 25565, target: "play.[your-domain]", ttl: "3600" }
        ],
        steps: [
            { title: "A Record (IP)", description: "Create an A record (e.g., 'play') pointing to your server's numerical IP address." },
            { title: "SRV Record (Port)", description: "If your server uses a non-standard port (not 25565), or you want a clean URL, use an SRV record." },
            { title: "Connection", description: "Players can now connect using 'play.yourdomain.com' without needing a port number!" }
        ]
    },
    {
        id: "minecraft-bedrock",
        title: "Minecraft (Bedrock)",
        icon: Gamepad2,
        category: "gaming",
        difficulty: "medium",
        description: "Custom IP for Bedrock / Pocket Edition servers.",
        officialDocsUrl: null,
        dnsRecords: [
            { type: "A", name: "play", value: "[server-ip]", ttl: "3600" }
        ],
        steps: [
            { title: "Set A Record", description: "Bedrock mostly relies on IPv4. Create an A record pointing to your server IP." },
            { title: "Port Note", description: "SRV records are NOT supported by Bedrock. Players must still add the port (default 19132) in their game client if it's not standard." }
        ]
    },

    // --- DOCS & BLOGS ---
    {
        id: "hashnode",
        title: "Hashnode",
        icon: FileText,
        category: "docs",
        difficulty: "easy",
        description: "Free blogging platform for developers with custom domain support.",
        officialDocsUrl: "https://support.hashnode.com/docs/custom-domain",
        dnsRecords: [
            { type: "CNAME", name: "@", value: "hashnode.network", ttl: "Auto" },
            { type: "CNAME", name: "www", value: "hashnode.network", ttl: "Auto" }
        ],
        steps: [
            { title: "Blog Dashboard", description: "In Hashnode: Blog Settings > Domain > Custom Domain." },
            { title: "DNS Mapping", description: "Add a CNAME record pointing to 'hashnode.network'." },
            { title: "Verify", description: "Click Verify in Hashnode. It usually takes a few minutes." }
        ]
    },
    {
        id: "mintlify",
        title: "Mintlify",
        icon: FileText,
        category: "docs",
        difficulty: "easy",
        description: "Beautiful, modern documentation that lives on your domain.",
        officialDocsUrl: "https://mintlify.com/docs/settings/custom-domain",
        dnsRecords: [
            { type: "CNAME", name: "docs", value: "mintlify.app", ttl: "Auto" }
        ],
        steps: [
            { title: "Project Settings", description: "In Mintlify dashboard, go to Settings > Custom Domain." },
            { title: "DNS Setup", description: "Add a CNAME record (usually 'docs') pointing to 'mintlify.app'." },
            { title: "Wait", description: "SSL certificate generation takes about 10-15 minutes." }
        ]
    }
];
