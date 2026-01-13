import { Rocket, Bot, TestTube, Zap, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
  // We use specific color classes for the hover glow
  color: string;
  borderColor: string;
  textColor: string;
}

const useCases: UseCase[] = [
  {
    icon: Rocket,
    title: "Side projects",
    description: "Give your weekend projects a memorable home without the domain cost.",
    color: "bg-blue-500",
    borderColor: "group-hover:border-blue-500/50",
    textColor: "group-hover:text-blue-500",
  },
  {
    icon: Bot,
    title: "Bots & APIs",
    description: "Host Discord bots, webhooks, or microservices on a clean URL.",
    color: "bg-purple-500",
    borderColor: "group-hover:border-purple-500/50",
    textColor: "group-hover:text-purple-500",
  },
  {
    icon: TestTube,
    title: "Testing & demos",
    description: "Share staging environments and demos with clients or teammates.",
    color: "bg-green-500",
    borderColor: "group-hover:border-green-500/50",
    textColor: "group-hover:text-green-500",
  },
  {
    icon: Zap,
    title: "MVPs & experiments",
    description: "Launch quickly to validate ideas before investing in a custom domain.",
    color: "bg-orange-500",
    borderColor: "group-hover:border-orange-500/50",
    textColor: "group-hover:text-orange-500",
  },
];

export const UseCases = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-background">
      {/* Center Glow Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--primary) / 0.15), transparent 70%)"
        }}
      />

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-mono text-xs sm:text-sm font-bold tracking-wider uppercase mb-3 block"
          >
            Use Cases
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-4 tracking-tight font-poppins"
          >
            Built for developers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Whether you're building a side project or launching an MVP, we've got you covered.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative p-6 h-full border bg-card/40 backdrop-blur-sm rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${useCase.borderColor}`}
              >
                {/* Hover Glow Background */}
                <div className={`absolute -inset-2 opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 ${useCase.color}`} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${useCase.color} bg-opacity-10 text-white`}>
                    {/* The icon itself inherits the color from the parent text on hover if we want, or keeps specific colors. 
                         Let's keep the icon colored by the 'color' prop but lighter bg. 
                     */}
                    <Icon className={`h-6 w-6 ${useCase.textColor.replace('group-hover:', '')}`} />
                  </div>

                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${useCase.textColor}`}>
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
