import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Globe, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">About Doofs</h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 md:mb-12">
            Free subdomains for Filipino developers and beyond.
          </p>
          
          <div className="space-y-8 md:space-y-12">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Doofs was created to remove barriers for developers. We believe everyone should be able to launch their projects with a professional domain—without worrying about costs. Whether you're building a portfolio, testing an API, or launching an MVP, we've got you covered.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                How It Works
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Simply authenticate with GitHub, choose your subdomain, and configure your DNS records. It's that simple. You get full control over A, AAAA, CNAME, TXT, and MX records for your subdomain.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
                Made in the Philippines
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Doofs is proudly built by Filipino developers, for the global developer community. Our brand colors are inspired by the Philippine flag—representing our roots and the vibrant tech community we're part of.
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