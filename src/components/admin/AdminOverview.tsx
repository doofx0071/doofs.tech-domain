import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatCard } from "./StatCard";
import { ChartContainer } from "./ChartContainer";
import { Users, Globe, Activity, TrendingUp, Clock, AlertCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { chartColors, tooltipConfig, animationConfig } from "@/lib/chartConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "@/styles/admin-dashboard.css";

export function AdminOverview() {
  const stats = useQuery(api.admin.getDashboardStats);
  const recentUsers = useQuery(api.admin.getAllUsers, { limit: 5 });
  const recentDomains = useQuery(api.admin.getRecentDomains, { limit: 5 });
  const userGrowthData = useQuery(api.admin.getUserGrowthData, { days: 30 });
  const domainGrowthData = useQuery(api.admin.getDomainCreationData, { days: 30 });

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <LoadingSpinner showText text="Loading dashboard data..." />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      variant: "primary" as const,
      trend: {
        value: `${stats.userGrowthRate7d}%`,
        isPositive: parseFloat(stats.userGrowthRate7d) > 0,
      },
    },
    {
      title: "Active Domains",
      value: stats.activeDomains,
      icon: Globe,
      variant: "success" as const,
      trend: {
        value: `${stats.domainGrowthRate7d}%`,
        isPositive: parseFloat(stats.domainGrowthRate7d) > 0,
      },
    },
    {
      title: "DNS Records",
      value: stats.dnsRecords,
      icon: Activity,
      variant: "info" as const,
      trend: {
        value: `${stats.dnsSuccessRate}% success`,
        isPositive: parseFloat(stats.dnsSuccessRate) > 95,
      },
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      variant: parseFloat(stats.successRate) > 95 ? "success" as const : "warning" as const,
      trend: {
        value: `${stats.totalActionsLast7Days} actions`,
        isPositive: true,
      },
    },
  ];

  // Combine user and domain data for activity chart
  const combinedActivityData = userGrowthData && domainGrowthData
    ? userGrowthData.map((userData, index) => ({
      ...userData,
      domains: domainGrowthData[index]?.total || 0,
      users: userData.count,
    }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Platform statistics and real-time insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="realtime-indicator h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Activity Overview Chart */}
      <ChartContainer
        title="Platform Activity (Last 30 Days)"
        description="User signups and domain creation trends"
        isLoading={!combinedActivityData.length}
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={combinedActivityData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDomains" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <YAxis stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <Tooltip {...tooltipConfig} />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              name="New Users"
              stroke={chartColors.primary}
              fillOpacity={1}
              fill="url(#colorUsers)"
              animationDuration={animationConfig.duration}
            />
            <Area
              type="monotone"
              dataKey="domains"
              name="New Domains"
              stroke={chartColors.success}
              fillOpacity={1}
              fill="url(#colorDomains)"
              animationDuration={animationConfig.duration}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Quick Stats and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <Badge variant="default" className="badge-glow">
                {stats.uptime}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active DNS Records</span>
              </div>
              <Badge variant="default">{stats.activeDnsRecords}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Error Records</span>
              </div>
              <Badge variant={stats.errorDnsRecords > 0 ? "destructive" : "secondary"}>
                {stats.errorDnsRecords}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Inactive Domains</span>
              <Badge variant="secondary">{stats.inactiveDomains}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 custom-scrollbar max-h-[200px] overflow-y-auto">
              {!recentUsers ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentUsers.map((user: any) => (
                  <div key={user._id} className="activity-item flex items-center justify-between p-2 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.joined || 0).toLocaleDateString()}
                      </p>
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
      </div>

      {/* Recent Domains */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!recentDomains ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground">No domains yet</p>
            ) : (
              recentDomains.map((domain: any) => (
                <div
                  key={domain._id}
                  className="activity-item flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {domain.subdomain}.doofs.tech
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {domain.ownerName || domain.ownerEmail || "No owner"}
                    </p>
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
  );
}