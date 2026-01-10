import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BookOpen, Terminal, Settings, HelpCircle, FileText, Menu, Code2, Globe, Shield, Server, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const RESERVED_ADMIN = ["admin", "administrator", "auth", "beta", "cache", "code", "config", "console", "dashboard", "data", "database", "db", "demo", "dev", "developer", "developers", "example", "internal", "local", "localhost", "login", "logout", "logs", "manage", "management", "monitor", "none", "null", "oauth", "ops", "panel", "portal", "prod", "production", "profile", "public", "register", "registration", "remote", "rest", "root", "search", "secure", "setting", "settings", "signin", "signup", "source", "stage", "staging", "sys", "system", "test", "tests", "tmp", "tool", "tools", "undefined", "update", "updates", "upload", "user", "users", "v1", "v2", "void", "vpn", "xml"];
const RESERVED_TECH = ["api", "app", "cdn", "docs", "documentation", "files", "ftp", "git", "graphql", "host", "http", "https", "imap", "image", "images", "img", "mail", "mailgun", "mx", "ns", "ns1", "ns2", "ns3", "ns4", "pop", "pop3", "server", "service", "services", "site", "sitemap", "smtp", "ssl", "static", "stats", "status", "tls", "web", "webmail", "www"];
const RESERVED_PLATFORM = ["about", "account", "aws", "azure", "billing", "blog", "careers", "cloudflare", "community", "contact", "convex", "doofs", "enterprise", "faq", "features", "forum", "github", "google", "help", "home", "info", "invite", "job", "jobs", "join", "legal", "live", "marketing", "netlify", "news", "page", "pages", "payment", "payments", "plans", "pricing", "privacy", "product", "sales", "shop", "store", "support", "team", "terms", "vercel"];

const DOCS_NAV = [
  {
    title: "Introduction",
    items: [
      { title: "What is Doofs.tech?", href: "#intro", icon: Globe },
      { title: "Getting Started", href: "#getting-started", icon: BookOpen },
    ]
  },
  {
    title: "Rules & Limits",
    items: [
      { title: "Platform Rules", href: "#rules", icon: Shield },
      { title: "DNS Management", href: "#dns", icon: Server },
    ]
  },
  {
    title: "Integrations",
    items: [
      { title: "Vercel", href: "#vercel", icon: Terminal },
      { title: "GitHub Pages", href: "#github", icon: Code2 },
      { title: "Netlify", href: "#netlify", icon: Settings },
      { title: "VPS / Server", href: "#vps", icon: Server },
    ]
  },
];

const DocsSidebar = ({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) => (
  <div className={`space-y-6 ${className}`}>
    {DOCS_NAV.map((section, i) => (
      <div key={i}>
        <h4 className="mb-2 text-sm font-semibold tracking-tight text-foreground/90 leading-none">
          {section.title}
        </h4>
        <div className="space-y-1">
          {section.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </a>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-muted/50 border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto my-4 text-foreground">
    {children}
  </pre>
);

const Docs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 container max-w-7xl mx-auto flex gap-10 px-4 py-8 md:py-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
          <ScrollArea className="h-full pr-4">
            <DocsSidebar />
          </ScrollArea>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[350px]">
              <div className="mt-6">
                <DocsSidebar onLinkClick={() => document.body.click()} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-16">
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">

            {/* Intro */}
            <section id="intro" className="scroll-mt-24">
              <h1 className="text-4xl font-black mb-4 tracking-tight lg:text-5xl">Documentation</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Welcome to Doofs.tech. We provide 100% free domains for developers, forever.
                No hidden fees, no credit card required.
              </p>
            </section>

            <Separator />

            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" /> Getting Started
              </h2>
              <p className="mb-4">Getting your free domain is simple and takes less than a minute.</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Sign in using your GitHub account (required for verification).</li>
                <li>Search for an available subdomain on the dashboard.</li>
                <li>Click <strong>Claim</strong> to instantly register it.</li>
                <li>Start adding DNS records to point to your project.</li>
              </ol>
            </section>

            {/* Rules */}
            <section id="rules" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-destructive" /> specific Rules & Limits
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-5 bg-card">
                  <h3 className="font-semibold mb-2">Domains per User</h3>
                  <p className="text-sm text-muted-foreground">
                    You can claim up to <strong>5 domains</strong> per account. This ensures fair availability for everyone.
                  </p>
                </div>
                <div className="border rounded-lg p-5 bg-card">
                  <h3 className="font-semibold mb-2">Subdomain Format</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Length: <strong>3 to 32</strong> characters</li>
                    <li>Allowed: Lowercase letters, numbers, hyphens</li>
                    <li>No start/end hyphens</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-muted text-sm border border-border">
                <strong className="text-foreground">Reserved Words:</strong> To ensure platform security and stability, certain subdomains are reserved. Hover (or tap) the categories to see details:
                <ul className="list-none mt-3 space-y-2 ml-1 text-muted-foreground">
                  <li className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                    <HoverCard>
                      <HoverCardTrigger className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors group">
                        <CircleAlert className="h-4 w-4 text-orange-500 group-hover:text-orange-600" />
                        <strong className="border-b border-dotted border-muted-foreground group-hover:border-foreground">Administrative</strong>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 sm:w-96 text-xs max-h-[300px] overflow-y-auto">
                        <p className="font-semibold mb-1 text-foreground">Restricted Administrative Names:</p>
                        <p className="leading-relaxed">{RESERVED_ADMIN.join(", ")}</p>
                      </HoverCardContent>
                    </HoverCard>
                    <span className="text-xs sm:text-sm">: High-privilege system roles (e.g., <code>admin</code>, <code>root</code>).</span>
                  </li>

                  <li className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                    <HoverCard>
                      <HoverCardTrigger className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors group">
                        <CircleAlert className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                        <strong className="border-b border-dotted border-muted-foreground group-hover:border-foreground">Technical</strong>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 sm:w-96 text-xs max-h-[300px] overflow-y-auto">
                        <p className="font-semibold mb-1 text-foreground">Restricted Technical Names:</p>
                        <p className="leading-relaxed">{RESERVED_TECH.join(", ")}</p>
                      </HoverCardContent>
                    </HoverCard>
                    <span className="text-xs sm:text-sm">: Infrastructure and protocol terms (e.g., <code>api</code>, <code>www</code>).</span>
                  </li>

                  <li className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                    <HoverCard>
                      <HoverCardTrigger className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors group">
                        <CircleAlert className="h-4 w-4 text-purple-500 group-hover:text-purple-600" />
                        <strong className="border-b border-dotted border-muted-foreground group-hover:border-foreground">Platform</strong>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 sm:w-96 text-xs max-h-[300px] overflow-y-auto">
                        <p className="font-semibold mb-1 text-foreground">Restricted Platform Names:</p>
                        <p className="leading-relaxed">{RESERVED_PLATFORM.join(", ")}</p>
                      </HoverCardContent>
                    </HoverCard>
                    <span className="text-xs sm:text-sm">: Brand and business protection (e.g., <code>doofs</code>, <code>vercel</code>).</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* DNS */}
            <section id="dns" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Server className="h-6 w-6 text-blue-500" /> DNS Management
              </h2>
              <p className="mb-4 text-muted-foreground">
                You have full control over the DNS records for your subdomain (e.g., <code>*.yourname.doofs.tech</code>).
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Supported Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Example Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-mono font-bold">A</td>
                      <td className="p-3">IPv4 Address</td>
                      <td className="p-3 font-mono text-muted-foreground">192.0.2.1</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">AAAA</td>
                      <td className="p-3">IPv6 Address</td>
                      <td className="p-3 font-mono text-muted-foreground">2001:db8::1</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">CNAME</td>
                      <td className="p-3">Alias to another domain</td>
                      <td className="p-3 font-mono text-muted-foreground">myapp.vercel.app</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">TXT</td>
                      <td className="p-3">Verification / SPF</td>
                      <td className="p-3 font-mono text-muted-foreground">v=spf1 include...</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">MX</td>
                      <td className="p-3">Mail Servers</td>
                      <td className="p-3 font-mono text-muted-foreground">mail.protection...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            <h2 className="text-2xl font-bold pt-4">Integration Guides</h2>

            {/* Vercel */}
            <section id="vercel" className="scroll-mt-24">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5" /> Vercel
              </h3>
              <p className="text-muted-foreground mb-4">
                To connect your domain to a Vercel project:
              </p>
              <ol className="list-decimal list-inside space-y-4 text-sm marker:text-muted-foreground">
                <li className="pl-2">
                  <span>In Doofs Dashboard, add a <strong>CNAME</strong> record:</span>
                  <CodeBlock>
                    Type: CNAME
                    Name: @ (or www)
                    Content: cname.vercel-dns.com
                  </CodeBlock>
                </li>
                <li className="pl-2">
                  In Vercel Project Settings → Domains, add your full domain (e.g., <code>your.doofs.tech</code>).
                </li>
              </ol>
            </section>

            {/* GitHub Pages */}
            <section id="github" className="scroll-mt-24">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Code2 className="h-5 w-5" /> GitHub Pages
              </h3>
              <ol className="list-decimal list-inside space-y-4 text-sm marker:text-muted-foreground">
                <li className="pl-2">
                  <span>Add a <strong>CNAME</strong> record pointing to your GitHub user page:</span>
                  <CodeBlock>
                    Type: CNAME
                    Name: @
                    Content: username.github.io
                  </CodeBlock>
                </li>
                <li className="pl-2">
                  In your GitHub Repo → Settings → Pages → Custom domain, enter your full domain.
                </li>
              </ol>
            </section>

            {/* VPS */}
            <section id="vps" className="scroll-mt-24">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Server className="h-5 w-5" /> VPS (DigitalOcean, Hetzner, EC2)
              </h3>
              <p className="text-muted-foreground mb-2">
                Simply point the A record to your server's public IP.
              </p>
              <CodeBlock>
                Type: A
                Name: @
                Content: 203.0.113.1  (Your Server IP)
              </CodeBlock>
            </section>

          </div>
        </main>
      </div >
      <Footer />
    </div >
  );
};

export default Docs;