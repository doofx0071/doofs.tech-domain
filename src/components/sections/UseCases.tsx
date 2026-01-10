import { Rocket, Bot, TestTube, Zap, LucideIcon } from "lucide-react";

interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const useCases: UseCase[] = [
  {
    icon: Rocket,
    title: "Side projects",
    description: "Give your weekend projects a memorable home without the domain cost.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Bot,
    title: "Bots & APIs",
    description: "Host Discord bots, webhooks, or microservices on a clean URL.",
    iconBg: "bg-chart-2/10",
    iconColor: "text-chart-2",
  },
  {
    icon: TestTube,
    title: "Testing & demos",
    description: "Share staging environments and demos with clients or teammates.",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    icon: Zap,
    title: "MVPs & experiments",
    description: "Launch quickly to validate ideas before investing in a custom domain.",
    iconBg: "bg-chart-4/40",
    iconColor: "text-foreground",
  },
];

export const UseCases = () => {
  return (
    <section className="py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--secondary)) 50%, hsl(var(--background)) 100%)"
        }}
      />
      
      <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="text-primary font-mono text-xs sm:text-sm font-bold tracking-wider uppercase mb-2 block">
            Use Cases
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Built for developers
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Whether you're building a side project or launching an MVP, we've got you covered.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={useCase.title}
                className="group bg-card border-2 border-border p-4 md:p-6 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon container */}
                <div className={`w-10 h-10 md:w-12 md:h-12 ${useCase.iconBg} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 md:h-6 md:w-6 ${useCase.iconColor}`} />
                </div>
                
                <h3 className="font-bold text-base md:text-lg mb-2 group-hover:text-primary transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
