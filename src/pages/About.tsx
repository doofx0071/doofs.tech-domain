import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Globe, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">About Doofs</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Free subdomains for Filipino developers and beyond.
          </p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Our Mission
              </h2>
              <p className="text-muted-foreground">
                Doofs was created to remove barriers for developers. We believe everyone should be able to launch their projects with a professional domain—without worrying about costs. Whether you're building a portfolio, testing an API, or launching an MVP, we've got you covered.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Simply authenticate with GitHub, choose your subdomain, and configure your DNS records. It's that simple. You get full control over A, AAAA, CNAME, TXT, and MX records for your subdomain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                Made in the Philippines
              </h2>
              <p className="text-muted-foreground">
                Doofs is proudly built by Filipino developers, for the global developer community. Our brand colors are inspired by the Philippine flag—representing our roots and the vibrant tech community we're part of.
              </p>
            </section>

            <section className="border-t border-border pt-8">
              <h2 className="text-xl font-semibold mb-4">Open Source</h2>
              <p className="text-muted-foreground">
                Doofs is open source. Check out our GitHub repository to contribute, report issues, or see how we built it.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;