import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChartContainer } from "./ChartContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Filter, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartColors, tooltipConfig, animationConfig } from "@/lib/chartConfig";
import "@/styles/admin-dashboard.css";

export function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [limit] = useState(100);

  const auditLogs = useQuery(api.auditLogs.getAllAuditLogs, { limit });
  const stats = useQuery(api.auditLogs.getAuditLogsStats, { timeRange });
  const timelineData = useQuery(api.admin.getActivityTimelineData, { timeRange });

  if (!auditLogs || !stats) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <LoadingSpinner showText text="Loading audit logs..." />
      </div>
    );
  }

  // Filter logs based on search query
  const filteredLogs = searchQuery
    ? auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : auditLogs;

  // Prepare action type distribution data
  const actionDistribution = Object.entries(stats.actionCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 15)
    .map(([action, count]) => ({
      action: action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      count: count as number,
    }));

  // Calculate peak hour
  const peakHour = timelineData
    ? timelineData.reduce((max, item) => (item.total > max.total ? item : max), timelineData[0])
    : null;

  // Average actions per user
  const avgActionsPerUser =
    stats.uniqueUsers > 0 ? (stats.totalActions / stats.uniqueUsers).toFixed(1) : "0";

  // Most common failed action
  const failedLogs = auditLogs.filter((log) => log.status === "failed");
  const failedActionCounts: Record<string, number> = {};
  failedLogs.forEach((log) => {
    failedActionCounts[log.action] = (failedActionCounts[log.action] || 0) + 1;
  });
  const mostCommonFailedAction = Object.entries(failedActionCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  const getActionBadgeColor = (action: string) => {
    if (action.includes("failed")) return "destructive";
    if (action.includes("login") || action.includes("first_login")) return "default";
    if (action.includes("password")) return "secondary";
    return "outline";
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "success" ? "default" : "destructive";
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;

    const headers = ["Timestamp", "User", "Email", "Action", "Status", "Details"];
    const rows = filteredLogs.map((log) => [
      formatTimestamp(log.timestamp),
      log.userName,
      log.userEmail,
      log.action,
      log.status,
      log.details || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all system activities and user actions</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animated-counter">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {timeRange === "24h" ? "24 hours" : timeRange === "7d" ? "7 days" : "30 days"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 animated-counter">
              {stats.successfulActions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalActions > 0
                ? Math.round((stats.successfulActions / stats.totalActions) * 100)
                : 0}
              % success rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 animated-counter">
              {stats.failedActions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalActions > 0
                ? Math.round((stats.failedActions / stats.totalActions) * 100)
                : 0}
              % failure rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animated-counter">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">With activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Actions/User</p>
                <p className="text-2xl font-bold mt-1">{avgActionsPerUser}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Activity Hour</p>
                <p className="text-xl font-bold mt-1 truncate">
                  {peakHour ? peakHour.label : "N/A"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Common Failure</p>
                <p className="text-sm font-bold mt-1 truncate">
                  {mostCommonFailedAction
                    ? mostCommonFailedAction.replace(/_/g, " ")
                    : "None"}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline Chart */}
      <ChartContainer
        title="Activity Timeline"
        description="Hourly activity count with success/failure breakdown"
        isLoading={!timelineData}
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.axis} style={{ fontSize: 10 }} />
            <YAxis stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <Tooltip {...tooltipConfig} />
            <Legend />
            <Line
              type="monotone"
              dataKey="success"
              name="Successful"
              stroke={chartColors.success}
              strokeWidth={2}
              dot={false}
              animationDuration={animationConfig.duration}
            />
            <Line
              type="monotone"
              dataKey="failed"
              name="Failed"
              stroke={chartColors.danger}
              strokeWidth={2}
              dot={false}
              animationDuration={animationConfig.duration}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Action Type Distribution Bar Chart */}
      <ChartContainer
        title="Action Type Distribution"
        description="Top 15 most common action types"
        isLoading={!actionDistribution.length}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={actionDistribution} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis type="number" stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <YAxis
              dataKey="action"
              type="category"
              stroke={chartColors.axis}
              style={{ fontSize: 11 }}
              width={150}
            />
            <Tooltip {...tooltipConfig} />
            <Bar
              dataKey="count"
              fill={chartColors.primary}
              radius={[0, 8, 8, 0]}
              animationDuration={animationConfig.duration}
            >
              {actionDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors.series[index % chartColors.series.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Search and Filter Bar */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {auditLogs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border custom-scrollbar">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Timestamp</TableHead>
                    <TableHead className="hidden md:table-cell">User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow
                      key={log._id}
                      className="activity-item"
                    >
                      <TableCell className="font-mono text-xs whitespace-nowrap hidden sm:table-cell">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="font-medium whitespace-nowrap">{log.userName}</p>
                          <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action)}>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                        <div className="sm:hidden text-[10px] text-muted-foreground mt-1">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[120px] sm:max-w-xs">
                        <p className="text-sm truncate">{log.details || "No details"}</p>
                        {log.metadata && (
                          <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                            {log.metadata.oldValue && (
                              <p className="truncate max-w-[200px]">
                                Old: <span className="font-mono">{log.metadata.oldValue}</span>
                              </p>
                            )}
                            {log.metadata.newValue && (
                              <p className="truncate max-w-[200px]">
                                New: <span className="font-mono">{log.metadata.newValue}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={getStatusBadgeColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
