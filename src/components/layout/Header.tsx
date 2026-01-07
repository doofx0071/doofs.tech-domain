import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "react-router-dom";
import logoLight from "@/assets/doofs-logo-light.svg";
import logoDark from "@/assets/doofs-logo-dark.svg";

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b-2 border-border">
      <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="flex items-center gap-2 font-mono font-bold text-xl tracking-tight">
          <img 
            src={theme === "dark" ? logoDark : logoLight} 
            alt="doofs.tech logo" 
            className="h-8 w-auto"
          />
          <span>doofs<span className="text-muted-foreground">.tech</span></span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Domains</span>
        </a>
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
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md transition-all">
            <Link to="/login">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
