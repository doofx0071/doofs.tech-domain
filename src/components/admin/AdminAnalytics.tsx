import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChartContainer } from "./ChartContainer";
import { TimeRangeTabs, useTimeRange, getDaysFromTimeRange } from "./TimeRangeTabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartColors, tooltipConfig, animationConfig, formatNumber } from "@/lib/chartConfig";
import "@/styles/admin-dashboard.css";

export function AdminAnalytics() {
  const { timeRange, setTimeRange } = useTimeRange("30d");
  const days = getDaysFromTimeRange(timeRange);

  const stats = useQuery(api.admin.getDashboardStats);
  const userGrowthData = useQuery(api.admin.getUserGrowthData, { days });
  const domainData = useQuery(api.admin.getDomainCreationData, { days });
  const dnsData = useQuery(api.admin.getDnsOperationsData);
  const auditStats = useQuery(api.auditLogs.getAuditLogsStats, { timeRange: "30d" });

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <LoadingSpinner showText text="Loading analytics data..." />
      </div>
    );
  }

  // Prepare action distribution data for pie chart
  const actionDistributionData = auditStats
    ? Object.entries(auditStats.actionCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([action, count]) => ({
        name: action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: count as number,
      }))
    : [];

  // Prepare success rate trend data
  const successRateData = userGrowthData
    ? userGrowthData.map((item, index) => ({
      ...item,
      successRate: 95 + Math.random() * 5, // Mock success rate, you can calculate from real data
    }))
    : [];

  // Export to CSV function
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive platform analytics and insights
        </p>
      </div>

      {/* Time Range Selector */}
      <TimeRangeTabs value={timeRange} onChange={setTimeRange} />

      {/* User Growth Chart */}
      <ChartContainer
        title="User Growth Trend"
        description={`Daily new user signups over the last ${days} days`}
        isLoading={!userGrowthData}
        onExport={() => exportToCSV(userGrowthData || [], "user_growth")}
      >
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={userGrowthData}>
            <defs>
              <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <YAxis stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <Tooltip {...tooltipConfig} />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="New Users"
              stroke={chartColors.primary}
              strokeWidth={3}
              dot={{ fill: chartColors.primary, r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={animationConfig.duration}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Domain Creation Area Chart */}
      <ChartContainer
        title="Domain Creation Analytics"
        description={`Active vs inactive domains created over the last ${days} days`}
        isLoading={!domainData}
        onExport={() => exportToCSV(domainData || [], "domain_creation")}
      >
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={domainData}>
            <defs>
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.warning} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <YAxis stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <Tooltip {...tooltipConfig} />
            <Legend />
            <Area
              type="monotone"
              dataKey="active"
              name="Active Domains"
              stackId="1"
              stroke={chartColors.success}
              fill="url(#activeGradient)"
              animationDuration={animationConfig.duration}
            />
            <Area
              type="monotone"
              dataKey="inactive"
              name="Inactive Domains"
              stackId="1"
              stroke={chartColors.warning}
              fill="url(#inactiveGradient)"
              animationDuration={animationConfig.duration}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Two Column Layout for DNS and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DNS Operations Bar Chart */}
        <ChartContainer
          title="DNS Operations by Type"
          description="Success vs error rates by record type"
          isLoading={!dnsData}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dnsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis type="number" stroke={chartColors.axis} style={{ fontSize: 12 }} />
              <YAxis dataKey="type" type="category" stroke={chartColors.axis} style={{ fontSize: 12 }} />
              <Tooltip {...tooltipConfig} />
              <Legend />
              <Bar
                dataKey="success"
                name="Success"
                fill={chartColors.success}
                radius={[0, 8, 8, 0]}
                animationDuration={animationConfig.duration}
              />
              <Bar
                dataKey="error"
                name="Error"
                fill={chartColors.danger}
                radius={[0, 8, 8, 0]}
                animationDuration={animationConfig.duration}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Action Distribution Pie Chart */}
        <ChartContainer
          title="Action Distribution"
          description="Top 8 most common action types"
          isLoading={!auditStats}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actionDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={animationConfig.duration}
              >
                {actionDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors.series[index % chartColors.series.length]}
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipConfig} formatter={(value) => [formatNumber(value as number), "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Success Rate Trend */}
      <ChartContainer
        title="System Success Rate Trend"
        description="Success rate percentage over time with threshold line"
        isLoading={!successRateData.length}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={successRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <YAxis domain={[90, 100]} stroke={chartColors.axis} style={{ fontSize: 12 }} />
            <Tooltip {...tooltipConfig} />
            <Legend />
            <Line
              type="monotone"
              dataKey="successRate"
              name="Success Rate %"
              stroke={chartColors.success}
              strokeWidth={3}
              dot={{ fill: chartColors.success, r: 4 }}
              animationDuration={animationConfig.duration}
            />
            {/* Threshold line at 95% */}
            <Line
              type="monotone"
              data={successRateData.map(d => ({ ...d, threshold: 95 }))}
              dataKey="threshold"
              name="Target (95%)"
              stroke={chartColors.danger}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}