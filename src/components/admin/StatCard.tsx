import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    variant?: "primary" | "success" | "warning" | "danger" | "info" | "glass";
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    variant = "glass",
    className,
}: StatCardProps) {
    const variantClasses = {
        primary: "stat-card-primary",
        success: "stat-card-success",
        warning: "stat-card-warning",
        danger: "stat-card-danger",
        info: "stat-card-info",
        glass: "glass-card",
    };

    return (
        <Card
            className={cn(
                "hover-lift overflow-hidden",
                variantClasses[variant],
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <p className="text-sm font-medium opacity-90">{title}</p>
                <div className="stat-icon-bg">
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold animated-counter">{value}</div>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                        <span
                            className={cn(
                                "font-medium",
                                trend.isPositive ? "trend-up" : "trend-down"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {trend.value}
                        </span>
                        <span className="opacity-70">from last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
