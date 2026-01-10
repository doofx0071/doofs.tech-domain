import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Zap, Heart, Code2, Users, ShieldCheck, Terminal, Server } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20 border-b">
          <div className="container max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">EST. 2025</Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              For Developers, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                By Developers.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Doofs.tech is a community-driven initiative providing free subdomains to help you showcase your projects to the world.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 px-4">
          <div className="container max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Global Access</h3>
                  <p className="text-muted-foreground">
                    We believe every developer, regardless of location or budget, deserves a professional presence on the web.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Zero Friction</h3>
                  <p className="text-muted-foreground">
                    No credit cards, no hidden fees, no complex setups. Just sign in with GitHub and claim your domain in seconds.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Community First</h3>
                  <p className="text-muted-foreground">
                    Proudly built by the Filipino open-source community, focused on empowering the next generation of builders.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>



        {/* FAQ - Why Free? */}
        <section className="py-20 px-4">
          <div className="container max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why is this free?</h2>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg mb-2">Is there a catch?</h3>
                <p className="text-muted-foreground">
                  No. We run this service with minimal overhead thanks to generous free tiers from our infrastructure providers and community sponsors. Our goal isn't profit—it's enablement.
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg mb-2">Who maintains this?</h3>
                <p className="text-muted-foreground">
                  Doofs.tech is maintained by a dedicated group of contributors. We are open about our operations and committed to longevity.
                </p>
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