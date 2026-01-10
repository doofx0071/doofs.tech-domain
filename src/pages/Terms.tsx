import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8">Terms of Service</h1>
          
          <div className="space-y-4 md:space-y-6 text-sm sm:text-base text-muted-foreground">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">By accessing and using doofs.tech, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">2. Service Description</h2>
              <p className="leading-relaxed">Doofs provides free subdomain services for developers. We offer DNS management for subdomains under the doofs.tech domain.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">3. User Responsibilities</h2>
              <p className="leading-relaxed">You agree not to use the service for any illegal, harmful, or abusive purposes. This includes but is not limited to: spam, phishing, malware distribution, or any content that violates applicable laws.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">4. Subdomain Limits</h2>
              <p className="leading-relaxed">Each account is limited to 3 subdomains during the beta period. We reserve the right to reclaim inactive subdomains (no DNS activity for 90+ days) with prior notice.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">5. Service Availability</h2>
              <p className="leading-relaxed">We strive for high uptime but do not guarantee uninterrupted service. Doofs is provided "as is" without warranties of any kind.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">6. Termination</h2>
              <p className="leading-relaxed">We reserve the right to terminate or suspend access to our service for violations of these terms or for any other reason at our discretion.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">7. Changes to Terms</h2>
              <p className="leading-relaxed">We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;