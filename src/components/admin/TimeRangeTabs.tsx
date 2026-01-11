import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export type TimeRange = "24h" | "7d" | "30d" | "90d";

interface TimeRangeTabsProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
    className?: string;
}

export function TimeRangeTabs({ value, onChange, className }: TimeRangeTabsProps) {
    return (
        <Tabs value={value} onValueChange={(v) => onChange(v as TimeRange)} className={className}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="24h">24 Hours</TabsTrigger>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}

// Hook for managing time range state
export function useTimeRange(defaultValue: TimeRange = "7d") {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultValue);

    return {
        timeRange,
        setTimeRange,
    };
}

// Helper to get days from time range
export function getDaysFromTimeRange(range: TimeRange): number {
    switch (range) {
        case "24h":
            return 1;
        case "7d":
            return 7;
        case "30d":
            return 30;
        case "90d":
            return 90;
        default:
            return 7;
    }
}
