import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";

export const Hero = () => {
  const [subdomain, setSubdomain] = useState("");
  const [checked, setChecked] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomain.trim()) {
      setChecked(true);
      setTimeout(() => setChecked(false), 3000);
    }
  };

  return (
    <section className="pt-20 md:pt-32 pb-8 md:pb-12 px-4 text-foreground relative overflow-hidden bg-background">
      {/* Top Fade Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />
      
      <div className="w-full px-4 md:px-12 lg:px-20 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <span className="text-destructive font-mono text-sm font-bold tracking-wider uppercase mb-4 block">
              Free domains for developers
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              A FREE NAME
              <br />
              <span className="text-accent dark:text-accent">FOR EVERYONE.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Made for <strong className="text-foreground">the world</strong>, by Filipinos.
            </p>
            <p className="text-muted-foreground">
              100% Free and open. No strings attached.
            </p>
          </div>

          {/* Right side - Check availability card */}
          <div className="bg-background text-foreground p-6 border-2 border-border shadow-xl">
            <h2 className="font-bold text-sm uppercase tracking-wider mb-4">
              Check Availability
            </h2>
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="flex border-2 border-border">
                <Input
                  type="text"
                  placeholder="yourname"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 border-0 focus-visible:ring-0 font-mono"
                />
                <span className="px-4 py-2 bg-muted text-muted-foreground font-mono text-sm flex items-center border-l-2 border-border">
                  .doofs.tech
                </span>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                {checked ? (
                  <>
                    <Check className="h-4 w-4" />
                    Available! Join waitlist below
                  </>
                ) : (
                  <>
                    CHECK AVAILABILITY
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              ❤️ Help us keep this free — <a href="#signup" className="text-destructive hover:underline">Support us</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
