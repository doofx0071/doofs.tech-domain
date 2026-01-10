import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header"; // Assuming Header exists here, adjust if needed
import { Footer } from "@/components/sections/Footer"; // Assuming Footer exists here
import { Button } from "@/components/ui/button";
import { Terminal, Home, FileText, MoveRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [typedPath, setTypedPath] = useState("");

  useEffect(() => {
    console.error("404 Error: Request to non-existent route:", location.pathname);

    // Typing effect for the path
    const path = location.pathname;
    let i = 0;
    const interval = setInterval(() => {
      setTypedPath(path.substring(0, i + 1));
      i++;
      if (i > path.length) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Assuming Header handles its own layout */}
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-10 w-24 h-24 border-4 border-muted-foreground/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/3 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

        <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 z-10">

          {/* Main 404 Glitch Text */}
          <div className="relative">
            <h1 className="text-[10rem] md:text-[14rem] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50 select-none">
              404
            </h1>
            <div className="absolute top-0 left-1 w-full h-full text-[10rem] md:text-[14rem] leading-none font-black tracking-tighter text-primary opacity-30 -z-10 translate-x-[4px] translate-y-[4px]">
              404
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Route <span className="text-destructive underline decoration-wavy underline-offset-4">Unhandled</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The requested URL dropped into the void. It might have been moved, deleted, or never existed.
            </p>
          </div>

          {/* Code Snippet Box - Neo Brutalist Style */}
          <div className="w-full max-w-lg mx-auto bg-card border-2 border-foreground shadow-[6px_6px_0px_0px_var(--foreground)] p-0 rounded-none overflow-hidden text-left mx-6">
            <div className="bg-foreground text-background px-4 py-2 flex items-center justify-between border-b-2 border-foreground">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-mono text-xs font-bold uppercase">System_Error.log</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive border border-background/20"></div>
                <div className="w-3 h-3 rounded-full bg-accent border border-background/20"></div>
              </div>
            </div>
            <div className="p-6 font-mono text-sm space-y-2 bg-background">
              <div className="flex gap-2">
                <span className="text-muted-foreground select-none">$</span>
                <span className="text-primary">GET</span>
                <span className="break-all">{typedPath}<span className="animate-pulse">_</span></span>
              </div>
              <div className="text-destructive font-bold">
                Error: 404 NOT_FOUND
              </div>
              <div className="text-muted-foreground text-xs pt-2 border-t border-border mt-4">
                at router.resolve (App.tsx:73:14)<br />
                at NavigationGuard (Auth.ts:42:0)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base border-2 border-transparent hover:border-foreground hover:bg-background hover:text-foreground transition-all shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_var(--foreground)]">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Return Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-2 border-foreground bg-background text-foreground hover:bg-muted transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_var(--foreground)]">
              <Link to="/docs">
                <FileText className="mr-2 h-5 w-5" />
                Read Documentation
              </Link>
            </Button>
          </div>

          <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 group transition-colors pt-4">
            Report a broken link <MoveRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </main>
      <Footer />
    </div>
  );
};
export default NotFound;
