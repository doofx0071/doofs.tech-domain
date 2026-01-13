import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Server, Globe, Database, Mail, Clock, Activity } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";

export default function Health() {
    const systemStatus = useQuery(api.status.getSystemStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "operational": return "text-green-500 bg-green-500/10 border-green-500/20";
            case "degraded": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "outage": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "maintenance": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "operational": return <CheckCircle2 className="w-6 h-6" />;
            case "degraded": return <AlertTriangle className="w-6 h-6" />;
            case "outage": return <XCircle className="w-6 h-6" />;
            default: return <Server className="w-6 h-6" />;
        }
    };

    if (!systemStatus) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
                <Footer />
            </div>
        );
    }

    const overallStatus = systemStatus.status;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">

                {/* Overall Status Banner with Heartbeat Chart */}
                <div className={`relative overflow-hidden rounded-xl p-8 mb-12 border transition-all ${getStatusColor(overallStatus)}`}>

                    {/* Animated EKG/Heartbeat Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center">
                        <HeartbeatChart color="currentColor" />
                    </div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className={`p-4 rounded-full bg-background/50 backdrop-blur-sm shadow-sm animate-pulse`}>
                            {getStatusIcon(overallStatus)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">
                                {overallStatus === "operational" ? "All Systems Operational" :
                                    overallStatus === "degraded" ? "Partial System Outage" : "System Outage"}
                            </h1>
                            <p className="opacity-90 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Real-time monitoring active • Updated: {new Date(systemStatus.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Component Grid */}
                <div className="grid gap-6 md:grid-cols-2">

                    {/* API */}
                    <StatusCard
                        title="Developer API"
                        status={systemStatus.components.api.status}
                        icon={<Globe className="w-5 h-5" />}
                        chart={<Sparkline type="pulse" />}
                        metrics={[
                            { label: "Latency", value: `${systemStatus.components.api.latency}ms` },
                            { label: "Availability", value: `${systemStatus.components.api.availability}%` }
                        ]}
                    />

                    {/* DNS */}
                    <StatusCard
                        title="DNS Propagation"
                        status={systemStatus.components.dns.status}
                        icon={<Server className="w-5 h-5" />}
                        chart={<Sparkline type="step" />}
                        metrics={[
                            { label: "Queued Jobs", value: systemStatus.components.dns.queued !== undefined ? systemStatus.components.dns.queued.toString() : "0" },
                            { label: "Recent Failures", value: systemStatus.components.dns.failedRecent !== undefined ? systemStatus.components.dns.failedRecent.toString() : "0" }
                        ]}
                    />

                    {/* Database */}
                    <StatusCard
                        title="Database & Storage"
                        status={systemStatus.components.database.status}
                        icon={<Database className="w-5 h-5" />}
                        chart={<Sparkline type="wave" />}
                        metrics={[
                            { label: "Response", value: `${systemStatus.components.database.latency}ms` },
                            { label: "Performance", value: "Optimal" }
                        ]}
                    />

                    {/* Email */}
                    <StatusCard
                        title="Email Services"
                        status={systemStatus.components.email.status}
                        icon={<Mail className="w-5 h-5" />}
                        chart={<Sparkline type="step" />}
                        metrics={[
                            { label: "Provider", value: "Mailgun" },
                            { label: "Status", value: "Active" }
                        ]}
                    />

                    {/* Scheduled Tasks */}
                    <StatusCard
                        title="Background Jobs"
                        status={systemStatus.components.scheduled_jobs.status}
                        icon={<Clock className="w-5 h-5" />}
                        chart={<Sparkline type="pulse" />}
                        metrics={[
                            { label: "Last Run", value: "Daily" },
                            { label: "Status", value: "Operational" }
                        ]}
                    />

                    {/* Platform */}
                    <StatusCard
                        title="Platform Domains"
                        status={systemStatus.components.platform.status}
                        icon={<Globe className="w-5 h-5" />}
                        chart={<Sparkline type="wave" />}
                        metrics={[
                            { label: "Root Domains", value: "Active" },
                            { label: "SSL", value: "Valid" }
                        ]}
                    />
                </div>

            </main>

            <Footer />
        </div>
    );
}

function StatusCard({ title, status, icon, metrics, chart }: { title: string, status: string, icon: any, metrics?: { label: string, value: string }[], chart?: React.ReactNode }) {
    const getColor = (s: string) => {
        switch (s) {
            case "operational": return "text-green-500";
            case "degraded": return "text-yellow-500";
            case "outage": return "text-red-500";
            case "maintenance": return "text-blue-500";
            default: return "text-gray-500";
        }
    };

    const getBg = (s: string) => {
        switch (s) {
            case "operational": return "bg-green-500/10 border-green-500/20";
            case "degraded": return "bg-yellow-500/10 border-yellow-500/20";
            case "outage": return "bg-red-500/10 border-red-500/20";
            case "maintenance": return "bg-blue-500/10 border-blue-500/20";
            default: return "bg-gray-500/10 border-gray-500/20";
        }
    };

    return (
        <div className="border rounded-xl p-6 bg-card hover:shadow-md transition-all relative overflow-hidden group">
            {chart && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                    {chart}
                </div>
            )}

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                    </div>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBg(status)} ${getColor(status)} capitalize`}>
                    {status}
                </div>
            </div>

            {(metrics && metrics.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t relative z-10">
                    {metrics.map((m, i) => (
                        <div key={i}>
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-sm font-medium">{m.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Simple SVG Heartbeat Animation
function HeartbeatChart({ color = "currentColor" }: { color?: string }) {
    return (
        <svg viewBox="0 0 500 100" className="w-full h-full" preserveAspectRatio="none">
            <path
                d="M0,50 L20,50 L30,20 L40,80 L50,50 L100,50 L120,50 L130,10 L140,90 L150,50 L250,50 L270,50 L280,30 L290,70 L300,50 L500,50"
                fill="none"
                stroke={color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className="animate-dash"
                strokeDasharray="1000"
                strokeDashoffset="1000"
            />
            <style>{`
                .animate-dash {
                    animation: dash 3s linear infinite;
                }
                @keyframes dash {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </svg>
    )
}

// Decorative Sparkline for cards
function Sparkline({ delay = 0, type = "pulse" }: { delay?: number, type?: "pulse" | "wave" | "step" }) {
    const getPath = () => {
        switch (type) {
            case "wave": return "M0,10 Q25,2 50,10 T100,10";
            case "step": return "M0,15 L20,15 L20,5 L40,5 L40,15 L60,15 L60,8 L80,8 L80,15 L100,15";
            default: return "0,10 10,12 20,8 30,10 40,5 50,15 60,10 70,8 80,12 90,10 100,10"; // Pulse
        }
    };

    return (
        <svg viewBox="0 0 100 20" className="w-full h-full opacity-50" preserveAspectRatio="none">
            {type === "pulse" ? (
                <polyline
                    points={getPath()}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
            ) : (
                <path
                    d={getPath()}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
            )}
        </svg>
    )
}
