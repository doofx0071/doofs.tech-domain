import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Activity, Settings, Plus } from "lucide-react";

const userDomains = [
  { id: 1, subdomain: "portfolio", status: "active", created: "2024-12-01", dnsRecords: 3 },
  { id: 2, subdomain: "api", status: "active", created: "2024-12-15", dnsRecords: 2 },
  { id: 3, subdomain: "staging", status: "inactive", created: "2025-01-02", dnsRecords: 1 },
];

const dnsRecords = [
  { id: 1, domain: "portfolio.doofs.tech", type: "A", name: "@", value: "192.168.1.1", ttl: 3600 },
  { id: 2, domain: "portfolio.doofs.tech", type: "CNAME", name: "www", value: "portfolio.doofs.tech", ttl: 3600 },
  { id: 3, domain: "api.doofs.tech", type: "A", name: "@", value: "10.0.0.1", ttl: 3600 },
  { id: 4, domain: "api.doofs.tech", type: "TXT", name: "_verify", value: "verification=abc123", ttl: 3600 },
];

export function ClientOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Your dashboard at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Domains
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userDomains.length}</div>
            <p className="text-xs text-muted-foreground">
              {userDomains.filter(d => d.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DNS Records
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dnsRecords.length}</div>
            <p className="text-xs text-muted-foreground">across all domains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Slots
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{3 - userDomains.length}</div>
            <p className="text-xs text-muted-foreground">of 3 domains remaining</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Claim New Domain
          </Button>
          <Button variant="outline">Manage DNS Records</Button>
          <Button variant="outline">View Documentation</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>Quick overview of your domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userDomains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{domain.subdomain}.doofs.tech</p>
                  <p className="text-xs text-muted-foreground">{domain.dnsRecords} DNS records</p>
                </div>
                <Badge variant={domain.status === "active" ? "default" : "secondary"}>
                  {domain.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}