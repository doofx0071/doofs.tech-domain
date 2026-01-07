import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Activity, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Users", value: "2,847", icon: Users, change: "+12%" },
  { label: "Active Domains", value: "1,523", icon: Globe, change: "+8%" },
  { label: "DNS Queries Today", value: "45.2K", icon: Activity, change: "+23%" },
  { label: "Uptime", value: "99.9%", icon: TrendingUp, change: "0%" },
];

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform analytics and insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Platform activity for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Chart visualization would go here</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            <p>User growth chart</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain Activity</CardTitle>
            <CardDescription>DNS queries and domain usage</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            <p>Domain activity chart</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}