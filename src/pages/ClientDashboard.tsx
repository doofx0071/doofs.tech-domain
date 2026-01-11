import { Link, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ClientOverview } from "@/components/client/ClientOverview";
import { ClientDomains } from "@/components/client/ClientDomains";
import { ClientDNS } from "@/components/client/ClientDNS";
import { ClientSettings } from "@/components/client/ClientSettings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { LayoutDashboard, Globe, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WelcomeToast } from "@/components/ui/WelcomeToast";
import { GlobalLoading } from "@/components/ui/loading-spinner";
import { OnboardingTour } from "@/components/client/OnboardingTour";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

const tabs = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Domains", url: "/dashboard/domains", icon: Globe },
  { title: "DNS Records", url: "/dashboard/dns", icon: Activity },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const ClientDashboard = () => {
  const location = useLocation();
  const updateLastLogin = useMutation(api.profile.updateLastLogin);
  const user = useQuery(api.users.currentUser);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ isNewUser: boolean; userName?: string } | null>(null);

  useEffect(() => {
    if (user && !welcomeData) {
      // Only run once when user first loads dashboard
      updateLastLogin().then(({ isNewUser }) => {
        setWelcomeData({
          isNewUser,
          userName: user.name || user.email?.split('@')[0] || 'User',
        });
        setShowWelcome(true);
      });
    }
  }, [user, updateLastLogin, welcomeData]);

  if (user === undefined) {
    return <GlobalLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <OnboardingTour />
      <Header />
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto">
          <nav className="flex justify-center gap-0.5 md:gap-1 px-4 md:px-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.url;
              let tourAttr = {};
              if (tab.url === "/dashboard/domains") tourAttr = { "data-tour": "domains-tab" };
              if (tab.url === "/dashboard/dns") tourAttr = { "data-tour": "dns-tab" };
              if (tab.url === "/dashboard/settings") tourAttr = { "data-tour": "settings-tab" };

              return (
                <Link
                  key={tab.title}
                  to={tab.url}
                  {...tourAttr}
                  className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">{tab.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              {location.pathname.split("/").filter((s) => s !== "").map((segment, index, array) => {
                const url = "/" + array.slice(0, index + 1).join("/");
                const isLast = index === array.length - 1;
                let title = segment.charAt(0).toUpperCase() + segment.slice(1);

                // Custom overrides
                if (segment === "dashboard") title = "Dashboard";
                else {
                  const tab = tabs.find(t => t.url === url);
                  if (tab) title = tab.title;
                }

                return (
                  <React.Fragment key={url}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={url}>{title}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Routes>
          <Route index element={<ClientOverview />} />
          <Route path="domains" element={<ClientDomains />} />
          <Route path="dns" element={<ClientDNS />} />
          <Route path="settings" element={<ClientSettings />} />
        </Routes>
      </main>

      <Footer />

      {/* Welcome Toast */}
      {showWelcome && welcomeData && (
        <WelcomeToast
          isNewUser={welcomeData.isNewUser}
          userName={welcomeData.userName}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
};

export default ClientDashboard;