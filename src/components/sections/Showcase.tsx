import { useState, useEffect } from "react";
import { Globe, Code, Rocket, Zap, Lightbulb, type LucideIcon } from "lucide-react";

interface ShowcaseCard {
  subdomain: string;
  icon: LucideIcon;
  label: string;
  color: string;
  iconColor: string;
}

const showcaseCards: ShowcaseCard[] = [
  {
    subdomain: "portfolio",
    icon: Globe,
    label: "Personal Sites",
    color: "bg-primary",
    iconColor: "text-primary-foreground",
  },
  {
    subdomain: "api",
    icon: Code,
    label: "API Endpoints",
    color: "bg-destructive",
    iconColor: "text-destructive-foreground",
  },
  {
    subdomain: "startup",
    icon: Rocket,
    label: "Startups",
    color: "bg-[hsl(173,58%,39%)]",
    iconColor: "text-white",
  },
  {
    subdomain: "bot",
    icon: Zap,
    label: "Discord Bots",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    subdomain: "project",
    icon: Lightbulb,
    label: "Side Projects",
    color: "bg-[hsl(43,74%,66%)]",
    iconColor: "text-foreground",
  },
];

export const Showcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseCards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-background">
      {/* Soft Center Glow Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--primary) / 0.15), transparent)`,
        }}
      />

      <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-12">
          <span className="text-destructive font-mono text-sm font-bold tracking-wider uppercase mb-4 block">
            Join the community
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Built for <span className="text-accent">everyone</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From personal portfolios to API endpoints, developers worldwide use
            doofs.tech for their projects.
          </p>
        </div>

        {/* Card Stack */}
        <div className="flex justify-center items-center min-h-[300px] relative">
          <div className="relative w-full max-w-sm h-[200px]">
            {showcaseCards.map((card, index) => {
              const offset = (index - activeIndex + showcaseCards.length) % showcaseCards.length;
              const isActive = offset === 0;
              const zIndex = showcaseCards.length - offset;
              
              // Calculate positions for stacking effect
              const translateX = offset * 20;
              const translateY = offset * 10;
              const scale = 1 - offset * 0.05;
              const opacity = offset > 2 ? 0 : 1 - offset * 0.2;

              return (
                <div
                  key={card.subdomain}
                  className="absolute inset-0 transition-all duration-500 ease-out cursor-pointer"
                  style={{
                    transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                    zIndex,
                    opacity,
                  }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div
                    className={`h-full border-2 border-border bg-card p-6 shadow-md flex flex-col justify-between ${
                      isActive ? "shadow-xl" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${card.color} flex items-center justify-center`}
                      >
                        {(() => {
                          const Icon = card.icon;
                          return <Icon className={`w-5 h-5 ${card.iconColor}`} />;
                        })()}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        {card.label}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-lg md:text-xl">
                        <span className="text-chart-2">{card.subdomain}</span>
                        <span className="text-muted-foreground">.doofs.tech</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {showcaseCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
          <div className="text-center p-4 border-2 border-border bg-card">
            <p
              className="text-2xl md:text-3xl font-black text-primary"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              24/7
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Always Online
            </p>
          </div>
          <div className="text-center p-4 border-2 border-border bg-card">
            <p
              className="text-2xl md:text-3xl font-black text-accent"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              100%
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Free Forever
            </p>
          </div>
          <div className="text-center p-4 border-2 border-border bg-card">
            <p
              className="text-2xl md:text-3xl font-black text-destructive"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              🇵🇭
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Pinoy Made
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
