import { Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSubdomains } from "../components/admin/AdminSubdomains";
import { AdminDomains } from "../components/admin/AdminDomains";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import logoLight from "@/assets/doofs-logo-light.svg";
import logoDark from "@/assets/doofs-logo-dark.svg";

const AdminDashboard = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header - Full width at top */}
      <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-6">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 font-mono font-bold text-base md:text-xl tracking-tight">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="doofs.tech logo"
            className="h-6 md:h-8 w-auto"
          />
          <span className="hidden sm:inline">doofs<span className="text-muted-foreground">.tech</span></span>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <span className="text-muted-foreground">Admin</span>
        </Link>
        <div className="flex-1" />
        <nav className="flex items-center gap-2 md:gap-6">
          <Link to="/about" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            About
          </Link>
          <Link to="/docs" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            Docs
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 md:h-9 md:w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </header>

      {/* Sidebar + Content below header */}
      <SidebarProvider>
        <div className="flex flex-1 w-full [&_.peer]:sticky [&_.peer]:top-14 md:[&_.peer]:top-16 [&_.peer>div:first-child]:h-[calc(100svh-3.5rem)] md:[&_.peer>div:first-child]:h-[calc(100svh-4rem)] [&_.peer>div:last-child]:top-14 md:[&_.peer>div:last-child]:top-16 [&_.peer>div:last-child]:h-[calc(100svh-3.5rem)] md:[&_.peer>div:last-child]:h-[calc(100svh-4rem)]">
          <AdminSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <main className="flex-1 p-3 md:p-6">
              <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subdomains" element={<AdminSubdomains />} />
                <Route path="domains" element={<AdminDomains />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="logs" element={<AdminAuditLogs />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;
