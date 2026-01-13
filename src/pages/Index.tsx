import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Terminal } from "@/components/sections/Terminal";
import { UseCases } from "@/components/sections/UseCases";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Showcase } from "@/components/sections/Showcase";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";
import { motion, useScroll, useSpring } from "framer-motion";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />
      <Header />
      <main>
        <Hero />
        <Terminal />
        <UseCases />
        <Features />
        <HowItWorks />
        <Showcase />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
