import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Terminal } from "@/components/sections/Terminal";
import { UseCases } from "@/components/sections/UseCases";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Showcase } from "@/components/sections/Showcase";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
