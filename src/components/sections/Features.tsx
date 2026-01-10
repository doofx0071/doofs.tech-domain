import { Check, Clock, Globe, Shield, Zap, Settings, Code, LucideIcon } from "lucide-react";

interface Feature {
  text: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  soon?: boolean;
}

const features: Feature[] = [
  { 
    text: "Free subdomains", 
    description: "Get your own .doofs.tech subdomain at zero cost, forever.",
    icon: Globe,
    available: true 
  },
  { 
    text: "Full DNS control", 
    description: "Configure A, AAAA, CNAME, and TXT records as needed.",
    icon: Settings,
    available: true 
  },
  { 
    text: "API access", 
    description: "Programmatically manage your domains via our REST API.",
    icon: Code,
    available: false, 
    soon: true 
  },
  { 
    text: "Instant setup", 
    description: "Go from signup to live domain in under 2 minutes.",
    icon: Zap,
    available: true 
  },
  { 
    text: "Abuse protection", 
    description: "Built-in security measures to keep the platform safe.",
    icon: Shield,
    available: true 
  },
];

export const Features = () => {
  return (
    <section className="py-12 md:py-20 px-4 relative overflow-hidden" id="features">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      
      <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="text-primary font-mono text-xs sm:text-sm font-bold tracking-wider uppercase mb-2 block">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            What you get
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to get your project online, completely free.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.text}
                className={`group relative flex items-start gap-3 md:gap-4 p-4 md:p-5 border-2 bg-card transition-all duration-300 ${
                  feature.available 
                    ? "border-border hover:border-primary/50 hover:shadow-lg" 
                    : "border-dashed border-border/50"
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0 ${
                  feature.available 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-sm md:text-base ${feature.available ? "text-foreground" : "text-muted-foreground"}`}>
                      {feature.text}
                    </h3>
                    {feature.soon && (
                      <span className="text-[10px] font-mono font-bold bg-accent text-accent-foreground px-1.5 py-0.5 flex-shrink-0">
                        SOON
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Checkmark for available features */}
                {feature.available && (
                  <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-chart-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
