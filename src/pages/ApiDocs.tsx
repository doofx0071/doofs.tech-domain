import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BookOpen, Terminal, Shield, Key, Menu, Globe, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ApiEndpoint } from "@/components/api/ApiEndpoint";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_NAV = [
    {
        title: "Overview",
        items: [
            { title: "Introduction", href: "#intro", icon: Globe },
            { title: "Authentication", href: "#auth", icon: Key },
            { title: "Rate Limits", href: "#limits", icon: Shield },
        ]
    },
    {
        title: "Domains",
        items: [
            { title: "List Domains", href: "#GET-api-v1-domains", icon: Terminal },
            { title: "Create Domain", href: "#POST-api-v1-domains", icon: Terminal },
            { title: "Get Domain", href: "#GET-api-v1-domains-id", icon: Terminal },
            { title: "Delete Domain", href: "#DELETE-api-v1-domains-id", icon: Terminal },
        ]
    },
    {
        title: "DNS Records",
        items: [
            { title: "List Records", href: "#GET-api-v1-domains-id-dns", icon: Terminal },
            { title: "Create Record", href: "#POST-api-v1-domains-id-dns", icon: Terminal },
            { title: "Update Record", href: "#PUT-api-v1-domains-domainId-dns-recordId", icon: Terminal },
            { title: "Delete Record", href: "#DELETE-api-v1-domains-domainId-dns-recordId", icon: Terminal },
        ]
    }
];

const ApiDocsSidebar = ({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) => (
    <div className={`space-y-6 ${className}`}>
        {API_NAV.map((section, i) => (
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
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                            title={item.title}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
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

const ApiDocs = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 container max-w-7xl mx-auto flex gap-10 px-4 py-8 md:py-12">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
                    <ScrollArea className="h-full pr-4">
                        <ApiDocsSidebar />
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
                                <ApiDocsSidebar onLinkClick={() => document.body.click()} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Main Content */}
                <main className="flex-1 min-w-0 pb-16">
                    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12 mb-16">

                        {/* Intro */}
                        <section id="intro" className="scroll-mt-24">
                            <h1 className="text-4xl font-black mb-4 tracking-tight lg:text-5xl">Developer API</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Automate your infrastructure with the Doofs.tech API. Manage domains, DNS records, and integrate custom workflows seamlessly.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <Button asChild>
                                    <a href="/dashboard/settings">Get API Key</a>
                                </Button>
                                <Button variant="outline" asChild>
                                    <a href="https://github.com/doofs-tech/api-examples" target="_blank" rel="noreferrer">View Examples</a>
                                </Button>
                            </div>
                        </section>

                        <Separator />

                        {/* Authentication */}
                        <section id="auth" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Key className="h-6 w-6 text-primary" /> Authentication
                            </h2>
                            <p className="mb-4">
                                Authenticate requests using a Bearer Token. You can generate an API key in your <a href="/dashboard/settings" className="font-medium text-primary hover:underline">Dashboard Settings</a>.
                            </p>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Security Note</AlertTitle>
                                <AlertDescription>
                                    Treat your API key like a password. Do not share it or commit it to public repositories.
                                </AlertDescription>
                            </Alert>
                            <CodeBlock>
                                Authorization: Bearer doofs_live_...
                            </CodeBlock>
                        </section>

                        {/* Limits */}
                        <section id="limits" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Shield className="h-6 w-6 text-destructive" /> Limits & Quotas
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-5 bg-card">
                                    <h3 className="font-semibold mb-2">Rate Limits</h3>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>100 requests / minute</strong> per user context.
                                    </p>
                                </div>
                                <div className="border rounded-lg p-5 bg-card">
                                    <h3 className="font-semibold mb-2">Concurrency</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Avoid parallel deletions or cascading updates to prevent race conditions.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <Separator className="my-12" />

                    {/* Domains Endpoints */}
                    <h3 className="text-2xl font-bold mb-8">Domains</h3>

                    <ApiEndpoint
                        method="GET"
                        path="/api/v1/domains"
                        description="Retrieve a list of all domains owned by the authenticated user."
                        examples={{
                            curl: `curl -X GET https://domain.doofs.tech/api/v1/domains \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
                            javascript: `const response = await fetch('https://domain.doofs.tech/api/v1/domains', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
                            python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get('https://domain.doofs.tech/api/v1/domains', headers=headers)
print(response.json())`
                        }}
                        responseExample={{
                            data: [
                                {
                                    _id: "domain_id_123",
                                    subdomain: "myapp",
                                    rootDomain: "doofs.tech",
                                    status: "active",
                                    createdAt: 1715423456789
                                }
                            ]
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        path="/api/v1/domains"
                        description="Register a new subdomain under doofs.tech. The subdomain must be unique."
                        parameters={[
                            { name: "subdomain", type: "string", required: true, description: "The subdomain to claim (e.g., 'myapp')" }
                        ]}
                        bodySchema={{ subdomain: "myapp" }}
                        examples={{
                            curl: `curl -X POST https://domain.doofs.tech/api/v1/domains \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"subdomain": "myapp"}'`,
                            javascript: `const response = await fetch('https://domain.doofs.tech/api/v1/domains', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ subdomain: 'myapp' })
});`,
                            python: `response = requests.post(
    'https://domain.doofs.tech/api/v1/domains',
    headers={'Authorization': 'Bearer KEY'},
    json={'subdomain': 'myapp'}
)`
                        }}
                        responseExample={{
                            success: true,
                            domain: "domain_id_new_123"
                        }}
                    />

                    <ApiEndpoint
                        method="GET"
                        path="/api/v1/domains/{id}"
                        description="Get details of a specific domain by its ID."
                        parameters={[
                            { name: "id", type: "string", required: true, description: "The ID of the domain" }
                        ]}
                        examples={{
                            curl: `curl -X GET https://domain.doofs.tech/api/v1/domains/domain_id_123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
                            javascript: `const response = await fetch('https://domain.doofs.tech/api/v1/domains/domain_id_123', ...);`,
                            python: `requests.get('https://domain.doofs.tech/api/v1/domains/domain_id_123', ...)`
                        }}
                        responseExample={{
                            data: {
                                _id: "domain_id_123",
                                subdomain: "myapp",
                                rootDomain: "doofs.tech",
                                status: "active",
                                createdAt: 1715423456789
                            }
                        }}
                    />

                    <ApiEndpoint
                        method="DELETE"
                        path="/api/v1/domains/{id}"
                        description="Permanently delete a domain and all its associated DNS records. This action cannot be undone."
                        parameters={[
                            { name: "id", type: "string", required: true, description: "The ID of the domain to delete" }
                        ]}
                        examples={{
                            curl: `curl -X DELETE https://domain.doofs.tech/api/v1/domains/domain_id_123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
                            javascript: `await fetch('https://domain.doofs.tech/api/v1/domains/domain_id_123', { method: 'DELETE', ... });`,
                            python: `requests.delete('https://domain.doofs.tech/api/v1/domains/domain_id_123', ...)`
                        }}
                        responseExample={{ success: true }}
                    />

                    <Separator className="my-12" />

                    {/* DNS Endpoints */}
                    <h3 className="text-2xl font-bold mb-8">DNS Records</h3>

                    <ApiEndpoint
                        method="GET"
                        path="/api/v1/domains/{id}/dns"
                        description="List all DNS records for a specific domain."
                        parameters={[
                            { name: "id", type: "string", required: true, description: "The ID of the domain" }
                        ]}
                        examples={{
                            curl: `curl -X GET https://domain.doofs.tech/api/v1/domains/domain_id_123/dns \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
                            javascript: `const res = await fetch('https://domain.doofs.tech/api/v1/domains/domain_id_123/dns', ...);`,
                            python: `requests.get('https://domain.doofs.tech/api/v1/domains/domain_id_123/dns', ...)`
                        }}
                        responseExample={{
                            data: [
                                {
                                    _id: "record_id_1",
                                    type: "A",
                                    name: "@",
                                    content: "1.2.3.4",
                                    ttl: 3600,
                                    priority: null
                                }
                            ]
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        path="/api/v1/domains/{id}/dns"
                        description="Create a new DNS record for a domain."
                        parameters={[
                            { name: "id", type: "string", required: true, description: "The ID of the domain" }
                        ]}
                        bodySchema={{
                            type: "A | AAAA | CNAME | TXT | MX",
                            name: "@",
                            content: "1.2.3.4",
                            ttl: 3600,
                            priority: 10
                        }}
                        examples={{
                            curl: `curl -X POST https://domain.doofs.tech/api/v1/domains/domain_id_123/dns \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"type":"A", "name":"@", "content":"1.2.3.4"}'`,
                            javascript: `await fetch('https://domain.doofs.tech/api/v1/domains/domain_id_123/dns', {
  method: 'POST',
  body: JSON.stringify({ type: 'A', name: '@', content: '1.2.3.4' })
  ...
});`,
                            python: `requests.post(..., json={'type':'A', 'name':'@', 'content':'1.2.3.4'})`
                        }}
                        responseExample={{ success: true, id: "record_id_new" }}
                    />

                    <ApiEndpoint
                        method="PUT"
                        path="/api/v1/domains/{domainId}/dns/{recordId}"
                        description="Update an existing DNS record."
                        parameters={[
                            { name: "domainId", type: "string", required: true, description: "ID of the domain" },
                            { name: "recordId", type: "string", required: true, description: "ID of the record to update" }
                        ]}
                        bodySchema={{
                            type: "A",
                            name: "@",
                            content: "5.6.7.8",
                        }}
                        examples={{
                            curl: `curl -X PUT https://domain.doofs.tech/api/v1/domains/dom_1/dns/rec_1 \\
  -H "Authorization: Bearer KEY" \\
  -d '{"type":"A", "name":"@", "content":"5.6.7.8"}'`,
                            javascript: `await fetch('.../dns/rec_1', { method: 'PUT', ... });`,
                            python: `requests.put('.../dns/rec_1', json={...})`
                        }}
                        responseExample={{ success: true }}
                    />

                    <ApiEndpoint
                        method="DELETE"
                        path="/api/v1/domains/{domainId}/dns/{recordId}"
                        description="Delete a DNS record."
                        parameters={[
                            { name: "domainId", type: "string", required: true, description: "ID of the domain" },
                            { name: "recordId", type: "string", required: true, description: "ID of the record to delete" }
                        ]}
                        examples={{
                            curl: `curl -X DELETE https://domain.doofs.tech/api/v1/domains/dom_1/dns/rec_1 \\
  -H "Authorization: Bearer KEY"`,
                            javascript: `await fetch('.../dns/rec_1', { method: 'DELETE', ... });`,
                            python: `requests.delete('.../dns/rec_1', ...)`
                        }}
                        responseExample={{ success: true }}
                    />

                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ApiDocs;
