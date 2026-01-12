import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, BarChart3, ArrowUpRight } from "lucide-react";

export function AdminApiUsage() {
    const data = useQuery(api.apiKeys.getGlobalUsage);

    if (!data) {
        return <div className="p-4 text-center text-muted-foreground">Loading usage statistics...</div>;
    }

    const { total24h, userStats } = data;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Summary Card */}
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Global API Traffic
                    </CardTitle>
                    <CardDescription>Requests in last 24h</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold mb-2">{total24h.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Total API calls processed by the platform across all users.
                    </p>
                </CardContent>
            </Card>

            {/* Top Users Table */}
            <Card className="col-span-5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Top API Users (24h)
                    </CardTitle>
                    <CardDescription>Users with highest API consumption.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Requests</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userStats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No active users in last 24h.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    userStats.map((stat) => (
                                        <TableRow key={stat.userId}>
                                            <TableCell className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={stat.image} />
                                                    <AvatarFallback>{stat.name?.[0] || "?"}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm">{stat.name || "Unknown"}</span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{stat.email}</TableCell>
                                            <TableCell className="text-right font-mono">{stat.count}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
