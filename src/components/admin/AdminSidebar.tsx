import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Globe, BarChart3, Settings, HelpCircle, LogOut, FileText, MessageSquare } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminRoute = import.meta.env.VITE_ADMIN_ROUTE || "/admin";

const menuItems = [
  { title: "Overview", url: `${adminRoute}/dashboard`, icon: LayoutDashboard },
  { title: "User Management", url: `${adminRoute}/dashboard/users`, icon: Users },
  { title: "Domain Management", url: `${adminRoute}/dashboard/domains`, icon: Globe },
  { title: "Subdomain Management", url: `${adminRoute}/dashboard/subdomains`, icon: Globe },
  { title: "Analytics", url: `${adminRoute}/dashboard/analytics`, icon: BarChart3 },
  { title: "Messages", url: `${adminRoute}/dashboard/messages`, icon: MessageSquare },
  { title: "Audit Logs", url: `${adminRoute}/dashboard/logs`, icon: FileText },
];

const secondaryItems = [
  { title: "Settings", url: `${adminRoute}/dashboard/settings`, icon: Settings },
  { title: "Help & Support", url: "/docs", icon: HelpCircle },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border h-auto">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sign Out"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarTrigger className="w-full" />
      </SidebarFooter>
    </Sidebar>
  );
}