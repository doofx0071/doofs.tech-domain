import { UserPlus, Search, Link, ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Sign in",
    description: "Create an account with your email or GitHub in seconds.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Choose a subdomain",
    description: "Pick any available name like yourapp.doofs.tech.",
    icon: Search,
  },
  {
    number: "03",
    title: "Point DNS to your app",
    description: "Configure A, AAAA, or CNAME records to connect your service.",
    icon: Link,
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--background)) 50%, hsl(var(--accent) / 0.1) 100%)"
        }}
      />
      
      <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <span className="text-primary font-mono text-xs sm:text-sm font-bold tracking-wider uppercase mb-2 block">
            Get Started
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            How it works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Three simple steps to get your free subdomain up and running.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Connecting line - desktop only */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center group">
                  {/* Number badge */}
                  <div className="relative mb-6">
                    {/* Outer ring with animation */}
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300" />
                    
                    {/* Inner circle with icon */}
                    <div className="relative w-20 h-20 rounded-full bg-card border-2 border-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground font-mono font-bold text-sm flex items-center justify-center border-2 border-background">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>

                  {/* Arrow connector - mobile only */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden my-6">
                      <ArrowRight className="h-6 w-6 text-primary/50 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
