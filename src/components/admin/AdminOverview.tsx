import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Activity, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Users", value: "2,847", icon: Users, change: "+12%" },
  { label: "Active Domains", value: "1,523", icon: Globe, change: "+8%" },
  { label: "DNS Queries Today", value: "45.2K", icon: Activity, change: "+23%" },
  { label: "Uptime", value: "99.9%", icon: TrendingUp, change: "0%" },
];

const mockUsers = [
  { id: 1, email: "dev@example.com", domains: 3, status: "active", joined: "2024-12-01" },
  { id: 2, email: "startup@gmail.com", domains: 2, status: "active", joined: "2024-12-15" },
  { id: 3, email: "builder@yahoo.com", domains: 1, status: "inactive", joined: "2025-01-02" },
];

const mockDomains = [
  { id: 1, subdomain: "portfolio", owner: "dev@example.com", status: "active", created: "2024-12-01" },
  { id: 2, subdomain: "api", owner: "startup@gmail.com", status: "active", created: "2024-12-15" },
  { id: 3, subdomain: "demo", owner: "builder@yahoo.com", status: "inactive", created: "2025-01-02" },
];

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Platform statistics at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user signups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.domains} domains</p>
                  </div>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Domains</CardTitle>
            <CardDescription>Latest domain registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDomains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{domain.subdomain}.doofs.tech</p>
                    <p className="text-xs text-muted-foreground">{domain.owner}</p>
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
    </div>
  );
}