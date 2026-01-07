import { Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminDomains } from "@/components/admin/AdminDomains";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
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
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-xl tracking-tight">
          <img 
            src={theme === "dark" ? logoDark : logoLight} 
            alt="doofs.tech logo" 
            className="h-8 w-auto"
          />
          <span>doofs<span className="text-muted-foreground">.tech</span></span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Admin</span>
        </Link>
        <div className="flex-1" />
        <nav className="flex items-center gap-6">
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </header>

      {/* Sidebar + Content below header */}
      <SidebarProvider>
        <div className="flex flex-1 w-full [&_.peer]:sticky [&_.peer]:top-16 [&_.peer>div:first-child]:h-[calc(100svh-4rem)] [&_.peer>div:last-child]:top-16 [&_.peer>div:last-child]:h-[calc(100svh-4rem)]">
          <AdminSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <main className="flex-1 p-6">
              <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="domains" element={<AdminDomains />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;