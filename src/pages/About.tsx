import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Zap,
  Code2,
  Terminal,
  Server,
  ShieldCheck,
  AlertTriangle,
  Github,
  Mail,
  Rocket,
  Settings,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = totalMiliseconds / end;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const About = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const y3 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center relative overflow-hidden border-b">
          {/* Grid Fade Background */}
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

          {/* Floating Icons Background with Parallax */}
          <motion.div
            style={{ opacity }}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10"
          >
            <motion.div
              style={{ y: y1 }}
              animate={{
                rotate: [0, 10, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[15%]"
            >
              <Globe className="h-12 w-12 text-primary" />
            </motion.div>
            <motion.div
              style={{ y: y2 }}
              animate={{
                rotate: [0, -10, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[20%] right-[10%]"
            >
              <Zap className="h-10 w-10 text-accent" />
            </motion.div>
            <motion.div
              style={{ y: y3 }}
              animate={{
                x: [0, 15, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[20%] left-[20%]"
            >
              <Code2 className="h-8 w-8 text-primary/50" />
            </motion.div>
          </motion.div>

          <div className="container max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4">About Domains</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl mb-6 tracking-tighter font-black font-['Poppins']"
            >
              <span className="block">For Developers,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                By Developers.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              <strong>Domains</strong> is a developer tool built by <strong>Doofs</strong> that provides free subdomains
              with DNS control for side projects, bots, APIs, demos, and experimental deployments.
            </motion.p>
          </div>
        </section>

        {/* Tech Stack Marquee */}
        <section className="py-12 border-b bg-muted/30 overflow-hidden">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">Built with Modern Tech</p>
            <div className="flex overflow-hidden group">
              <motion.div
                animate={{
                  x: [0, -1035],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex gap-12 whitespace-nowrap px-12"
              >
                {[
                  "React 18", "Convex", "Tailwind CSS", "Framer Motion", "Lucide Icons", "Vite", "TypeScript",
                  "React 18", "Convex", "Tailwind CSS", "Framer Motion", "Lucide Icons", "Vite", "TypeScript"
                ].map((tech, i) => (
                  <span key={i} className="text-2xl md:text-3xl font-bold opacity-30 group-hover:opacity-100 transition-opacity cursor-default">
                    {tech}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Unified Mission Section (Replaces Old About & Why) */}
        <motion.section
          {...fadeInUp}
          className="py-24 px-4 border-b relative overflow-hidden"
        >
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 z-0 opacity-30">
            <div
              className="absolute inset-0 bg-primary/10 mask-image-grid"
              style={{
                maskImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M40 40V0H0v40h40zM1 1h38v38H1V1z' fill='%23000' /%3E%3C/svg%3E")`,
                maskSize: '40px 40px'
              }}
            />
          </div>
          <div className="container max-w-5xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-start">

              {/* Left: The Mission */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Why this exists
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  This project exists to <strong className="text-foreground">remove friction</strong>.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Buying domains for experiments is expensive, and managing DNS for small projects often feels heavier than it needs to be.
                  <strong>Domains</strong> gives developers a simple place to ship ideas without committing to a paid domain upfront.
                </p>
              </div>

              {/* Right: The Ecosystem / Context */}
              <div className="bg-muted/30 p-8 rounded-3xl border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Code2 className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    About <span className="font-extrabold">Doofs</span>
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Doofs is a personal portfolio and ecosystem of developer tools and experiments.
                    <strong> Domains</strong> is one of several projects built and maintained under the <code>doofs.tech</code> umbrella by
                    <a href="https://github.com/damascusalexander" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline font-medium">
                      Damascus
                    </a>.
                  </p>

                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/doofs-tech" target="_blank" rel="noopener noreferrer" className="gap-2">
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        {/* What This Service Is For */}
        <section className="py-16 px-4 border-b relative overflow-hidden">
          {/* Dot Matrix Background */}
          <div
            className="absolute inset-0 z-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="container max-w-4xl mx-auto relative z-10">
            <motion.h2
              {...fadeInUp}
              className="text-2xl md:text-3xl font-bold mb-8 text-center"
            >
              What this service is for
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Rocket,
                  title: "Side projects & prototypes",
                  desc: "Quick way to put your experiments online. Perfect for that domain idea you have at 3 AM.",
                  color: "green",
                  className: "md:col-span-2"
                },
                {
                  icon: Terminal,
                  title: "Bots & API endpoints",
                  desc: "Host your Discord bots and webhooks with ease.",
                  color: "blue",
                  className: "md:col-span-1"
                },
                {
                  icon: Code2,
                  title: "Testing & demos",
                  desc: "Showcase your work to clients or your team quickly.",
                  color: "yellow",
                  className: "md:col-span-1"
                },
                {
                  icon: Server,
                  title: "Early-stage MVPs",
                  desc: "Get your product in front of users before committing to a premium domain stack.",
                  color: "purple",
                  className: "md:col-span-2"
                }
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemVariants} className={item.className}>
                  <Card className={`h-full bg-card/80 backdrop-blur-sm border-${item.color}-500/20 hover:border-${item.color}-500/50 transition-all cursor-default transform hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md`}>
                    <CardContent className="pt-6 h-full flex flex-col">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-12 w-12 shrink-0 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 shadow-inner`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              {...fadeInUp}
              className="text-center text-muted-foreground mt-8 text-lg"
            >
              If you're building something experimental and just need a real domain with DNS control, <strong className="text-foreground">this is for you</strong>.
            </motion.p>
          </div>
        </section>

        {/* What It's Not For - Redesigned */}
        <section className="py-24 px-4 bg-red-50/50 dark:bg-red-950/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://patterncraft.fun/patterns/stripes-sm.svg')] opacity-5" />
          <div className="container max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col items-center mb-16 text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold uppercase tracking-wide mb-4 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4" />
                Restrictions
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                What it's <span className="text-destructive underline decoration-wavy decoration-2 underline-offset-4">not</span> for
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                We're building a tool for experimentation, not a platform for mission-critical infrastructure or harmful activities.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Critical Infrastructure", desc: "Production systems where 100% uptime is non-negotiable.", icon: Server },
                { title: "Financial Services", desc: "Banking, payments, or high-risk secure data handling.", icon: ShieldCheck },
                { title: "Malicious Activity", desc: "Phishing, spam, malware distribution, or scams.", icon: AlertTriangle },
                { title: "Brand Impersonation", desc: "Squatting on trademarks or deceptive domain usage.", icon: XCircle }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-background border-2 border-muted hover:border-destructive/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-destructive/5"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <item.icon className="h-24 w-24 -rotate-12" />
                  </div>
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-destructive transition-colors">{item.title}</h3>
                      <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-xl bg-destructive/5 border border-destructive/10 text-center max-w-3xl mx-auto">
              <p className="text-sm md:text-base font-medium text-destructive/80">
                ⚠️ Subdomains found violating these policies will be suspended immediately without notice.
              </p>
            </div>
          </div>
        </section>

        {/* Safety & Abuse Prevention - Redesigned */}
        <section className="py-24 px-4 border-t relative overflow-hidden">
          {/* Hexagon Pattern Background */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-green-500/5 dark:bg-green-400/5 mask-image-hexagons"
              style={{
                maskImage: `url("data:image/svg+xml,%3Csvg width='24' height='42' viewBox='0 0 24 42' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h24v42H0z' fill='none'/%3E%3Cpath d='M12 11.5L24 5v13l-12 6.5L0 18V5z' fill='%23000' /%3E%3C/svg%3E")`,
                maskSize: '60px 60px'
              }}
            />
          </div>
          <div className="container max-w-5xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 md:order-1"
              >
                <div className="grid gap-4">
                  {[
                    { title: "Rate Limiting", desc: "Smart limits to prevent abuse and ensure stability." },
                    { title: "Restricted Names", desc: "Automatic blocklist for high-risk keywords." },
                    { title: "Active Monitoring", desc: "Automated scanning for suspicious patterns." },
                    { title: "Community Reporting", desc: "Swift action on reported policy violations." }
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border hover:border-green-500/50 transition-colors group cursor-default"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-shadow">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="order-1 md:order-2 text-center md:text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-bold uppercase tracking-wide mb-6">
                  <ShieldCheck className="h-4 w-4" />
                  Trust & Safety
                </span>
                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                  Keeping the platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">safe</span> for everyone.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  We take platform health seriously. Our automated systems and community guidelines ensure that <strong>doofs.tech</strong> remains a clean, reliable space for legitimate developers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button variant="outline" className="gap-2 border-2 font-bold hover:bg-green-50 dark:hover:bg-green-950/20" asChild>
                    <a href="mailto:abuse@doofs.tech">Report Abuse</a>
                  </Button>
                  <Button variant="ghost" className="gap-2" asChild>
                    <Link to="/contact">Contact Support <span aria-hidden="true">&rarr;</span></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>



      </main>
      <Footer />
    </div>
  );
};

export default About;