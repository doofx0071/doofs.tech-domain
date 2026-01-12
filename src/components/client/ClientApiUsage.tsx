import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Zap, Clock } from "lucide-react";

export function ClientApiUsage() {
    const usage = useQuery(api.apiKeys.getMyUsage);

    if (!usage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>API Usage</CardTitle>
                    <CardDescription>Loading usage statistics...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const { limit, count24h, timeline } = usage;
    // Simple projection: if count24h > limit * 60 * 24 (impossible since limit is per minute)
    // Actually limit is per minute.
    // There is no daily limit enforce, but we can show "Requests Today".

    // We can show "Estimated Average RPM" over the active hours?
    // Or just "Requests Today" and "Current Rate Limit".

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        API Usage
                    </CardTitle>
                    <div className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                        Last 24 Hours
                    </div>
                </div>
                <CardDescription>Track your API consumption.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{count24h.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">calls</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Rate Limit</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{limit}</span>
                            <span className="text-xs text-muted-foreground">req/min</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Activity (Last 24h)</span>
                        <span>Now</span>
                    </div>
                    {/* Simple Bar Chart Visualization */}
                    <div className="h-16 flex items-end gap-1">
                        {timeline.map((count, i) => {
                            // Normalize height based on max value
                            const max = Math.max(...timeline, 10); // Minimum scale of 10
                            const height = Math.max((count / max) * 100, 5); // Min height 5%

                            return (
                                <div
                                    key={i}
                                    className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-sm relative group"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10 border">
                                        {count} req
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
