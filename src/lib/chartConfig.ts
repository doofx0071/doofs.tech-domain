/**
 * Chart Configuration for Admin Dashboard
 * Centralized color schemes, styles, and settings for Recharts
 */

// Color Palette - HSL based for better dark mode support
export const chartColors = {
    primary: "hsl(262, 83%, 58%)",
    primaryLight: "hsl(262, 83%, 68%)",
    primaryDark: "hsl(262, 83%, 48%)",

    secondary: "hsl(243, 75%, 59%)",
    secondaryLight: "hsl(243, 75%, 69%)",
    secondaryDark: "hsl(243, 75%, 49%)",

    success: "hsl(142, 76%, 36%)",
    successLight: "hsl(142, 76%, 46%)",

    warning: "hsl(45, 93%, 47%)",
    warningLight: "hsl(45, 93%, 57%)",

    danger: "hsl(348, 83%, 47%)",
    dangerLight: "hsl(348, 83%, 57%)",

    info: "hsl(199, 89%, 48%)",
    infoLight: "hsl(199, 89%, 58%)",

    // Chart series colors
    series: [
        "hsl(262, 83%, 58%)", // purple
        "hsl(199, 89%, 48%)", // blue
        "hsl(142, 76%, 36%)", // green
        "hsl(45, 93%, 47%)",  // yellow
        "hsl(348, 83%, 47%)", // red
        "hsl(291, 64%, 42%)", // pink
        "hsl(24, 100%, 50%)", // orange
        "hsl(180, 100%, 25%)", // teal
    ],

    // Grid and axis colors
    grid: "hsl(0, 0%, 20%)",
    gridLight: "hsl(0, 0%, 90%)",
    axis: "hsl(0, 0%, 50%)",
    axisLight: "hsl(0, 0%, 60%)",
};

// Gradient definitions for area charts
export const chartGradients = {
    primary: {
        id: "primaryGradient",
        colors: ["hsl(262, 83%, 58%)", "hsl(262, 83%, 58%, 0)"],
    },
    success: {
        id: "successGradient",
        colors: ["hsl(142, 76%, 36%)", "hsl(142, 76%, 36%, 0)"],
    },
    danger: {
        id: "dangerGradient",
        colors: ["hsl(348, 83%, 47%)", "hsl(348, 83%, 47%, 0)"],
    },
    dual: {
        id: "dualGradient",
        colors: ["hsl(262, 83%, 58%)", "hsl(243, 75%, 59%)"],
    },
};

// Default chart margins
export const defaultMargins = {
    top: 20,
    right: 30,
    left: 20,
    bottom: 20,
};

// Responsive breakpoints
export const chartBreakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
};

// Tooltip configuration
export const tooltipConfig = {
    contentStyle: {
        backgroundColor: "hsl(0, 0%, 10%)",
        border: "1px solid hsl(0, 0%, 20%)",
        borderRadius: "8px",
        padding: "12px",
    },
    itemStyle: {
        color: "hsl(0, 0%, 90%)",
    },
    labelStyle: {
        color: "hsl(0, 0%, 70%)",
        fontWeight: "600",
    },
};

// Animation settings
export const animationConfig = {
    duration: 800,
    easing: "ease-in-out" as const,
};

// Format numbers for display
export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};

// Format percentage
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

// Custom tooltip formatter
export const customTooltipFormatter = (value: number, name: string) => {
    return [formatNumber(value), name];
};
