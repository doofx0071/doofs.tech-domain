import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminAnalytics() {
  const stats = useQuery(api.admin.getDashboardStats);

  // We can just reuse stats for now, but no fake charts.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform analytics and insights.</p>
      </div>

      {!stats ? (
        <div className="text-muted-foreground text-center py-10">Loading analytics data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Active Domains</CardTitle>
              <CardDescription>Current active domains on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.activeDomains}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Registered user base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total DNS Records</CardTitle>
              <CardDescription>Managed DNS records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.dnsRecords}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}