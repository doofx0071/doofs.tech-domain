import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Activity, Settings, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "react-router-dom";

export function ClientOverview() {
  const stats = useQuery(api.dns.getMyStats);
  const domains = useQuery(api.domains.listMine, {});

  if (!stats || !domains) {
    return <div className="p-8 text-center text-muted-foreground">Loading overview...</div>;
  }

  const availableSlots = Math.max(0, stats.domainsLimit - stats.totalDomains);

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
            <div className="text-2xl font-bold">{stats.totalDomains}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeDomains} active
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
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
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
            <div className="text-2xl font-bold">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">of {stats.domainsLimit} domains remaining</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-3">
          <Link to="/dashboard/domains" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Claim New Domain
            </Button>
          </Link>
          <Link to="/dashboard/dns" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Manage DNS Records</Button>
          </Link>
          <Link to="/docs" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">View Documentation</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>Quick overview of your domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {domains.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No domains yet.</p>
            ) : (
              domains.slice(0, 5).map((domain: any) => (
                <div key={domain._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{domain.subdomain}.doofs.tech</p>
                    <p className="text-xs text-muted-foreground">Created {new Date(domain.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={domain.status === "active" ? "default" : "secondary"}>
                    {domain.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div >
  );
}