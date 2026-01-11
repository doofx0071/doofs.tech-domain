import { Moon, Sun, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "@/assets/doofs-logo-light.svg";
import logoDark from "@/assets/doofs-logo-dark.svg";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Avatar from "boring-avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Get avatar configuration
  const getAvatarConfig = () => {
    if (!user) return { variant: "marble", colors: ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"], name: "User" };

    const palettes: Record<string, string[]> = {
      "0": ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"],
      "1": ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
      "2": ["#f94144", "#f3722c", "#f8961e", "#f9844a", "#f9c74f"],
      "3": ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"],
      "4": ["#7209b7", "#560bad", "#b5179e", "#f72585", "#4361ee"],
      "5": ["#e0b0ff", "#b4e4ff", "#ffe4e1", "#f0e68c", "#d8bfd8"],
    };

    const avatarVariant = user.avatarVariant || "marble";
    const avatarSeed = user.avatar || user.name || "User";
    const paletteIndex = avatarSeed.split("-")[1] || "0";
    const colors = palettes[paletteIndex] || palettes["0"];

    return {
      variant: avatarVariant,
      colors,
      name: user.name || "User",
    };
  };

  const avatarConfig = getAvatarConfig();
  const githubAccount = user?.accounts?.find((acc: any) => acc.provider === "github");
  const hasGitHubImage = githubAccount && user?.image;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b-2 border-border">
      <div className="container max-w-7xl mx-auto flex items-center justify-between h-14 md:h-16 px-4 md:px-6">
        <a href="/" className="flex items-center gap-1.5 md:gap-2 font-mono font-bold text-base md:text-xl tracking-tight">
          <img
            key={theme}
            src={theme === "dark" ? logoDark : logoLight}
            alt="doofs.tech logo"
            className="h-6 md:h-8 w-auto"
          />
          <span>doofs<span className="text-muted-foreground text-[10px] sm:text-xs">.tech</span></span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Domains</span>
        </a>
        <nav className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            About
          </Link>
          <Link to="/docs" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            Docs
          </Link>
          <Link to="/tutorials" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            Tutorials
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

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email || "No email"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md transition-all text-xs sm:text-sm px-3 sm:px-4 h-8 md:h-9">
              <Link to="/login">Get Started</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
