import { Link, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ClientOverview } from "@/components/client/ClientOverview";
import { ClientDomains } from "@/components/client/ClientDomains";
import { ClientDNS } from "@/components/client/ClientDNS";
import { ClientSettings } from "@/components/client/ClientSettings";
import { Header } from "@/components/layout/Header";
import { LayoutDashboard, Globe, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Domains", url: "/dashboard/domains", icon: Globe },
  { title: "DNS Records", url: "/dashboard/dns", icon: Activity },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const ClientDashboard = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <div className="border-b border-border">
        <nav className="flex gap-1 px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.url;
            return (
              <Link
                key={tab.title}
                to={tab.url}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <main className="flex-1 p-6">
        <Routes>
          <Route index element={<ClientOverview />} />
          <Route path="domains" element={<ClientDomains />} />
          <Route path="dns" element={<ClientDNS />} />
          <Route path="settings" element={<ClientSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default ClientDashboard;