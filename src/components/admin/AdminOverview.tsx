import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Activity, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminOverview() {
  const stats = useQuery(api.admin.getDashboardStats);
  const recentUsers = useQuery(api.admin.getAllUsers, { limit: 5 });
  const recentDomains = useQuery(api.admin.getRecentDomains, { limit: 5 });

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <LoadingSpinner showText text="Loading dashboard data..." />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers ?? 0, icon: Users, change: "0%" },
    { label: "Active Domains", value: stats.activeDomains ?? 0, icon: Globe, change: "0%" },
    { label: "DNS Records", value: stats.dnsRecords ?? 0, icon: Activity, change: "0%" },
    { label: "Uptime", value: stats.uptime, icon: TrendingUp, change: "0%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Platform statistics at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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
              {!recentUsers ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Joined {new Date(user.joined || 0).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                ))
              )}
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
              {!recentDomains ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentDomains.length === 0 ? (
                <p className="text-sm text-muted-foreground">No domains found.</p>
              ) : (
                recentDomains.map((domain: any) => (
                  <div key={domain._id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{domain.subdomain}.doofs.tech</p>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground truncate" title={domain.ownerEmail}>
                          {domain.ownerName || domain.ownerEmail || "No owner"}
                        </span>
                        {domain.ownerName && (
                          <span className="text-[10px] text-muted-foreground/70 truncate">{domain.ownerEmail}</span>
                        )}
                      </div>
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
      </div>
    </div>
  );
}