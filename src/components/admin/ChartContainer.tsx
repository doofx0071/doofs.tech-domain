import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
    title: string;
    description?: string;
    children: ReactNode;
    isLoading?: boolean;
    onRefresh?: () => void;
    onExport?: () => void;
    className?: string;
    actions?: ReactNode;
}

export function ChartContainer({
    title,
    description,
    children,
    isLoading = false,
    onRefresh,
    onExport,
    className,
    actions,
}: ChartContainerProps) {
    return (
        <Card className={cn("chart-container", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    {description && (
                        <CardDescription className="text-sm">{description}</CardDescription>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                    {onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    )}
                    {onExport && (
                        <Button variant="outline" size="sm" onClick={onExport}>
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="skeleton w-full h-full" />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
