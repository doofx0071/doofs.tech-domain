import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminAuditLogs() {
  const auditLogs = useQuery(api.auditLogs.getAllAuditLogs, { limit: 100 });
  const stats = useQuery(api.auditLogs.getAuditLogsStats, { timeRange: "7d" });

  if (!auditLogs || !stats) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <LoadingSpinner showText text="Loading audit logs..." />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">With activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
          <CardDescription>Most common actions in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.actionCounts)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 8)
              .map(([action, count]) => (
                <div key={action} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  <p className="text-2xl font-bold">{count as number}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest 100 audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] sm:h-[600px] w-full rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Timestamp</TableHead>
                    <TableHead className="hidden md:table-cell">User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log._id}>
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
