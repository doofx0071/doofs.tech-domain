import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8">Privacy Policy</h1>
          
          <div className="space-y-4 md:space-y-6 text-sm sm:text-base text-muted-foreground">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">1. Information We Collect</h2>
              <p className="leading-relaxed">We collect minimal information necessary to provide our service: your GitHub account information (username, email) for authentication, and DNS records you configure for your subdomains.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">2. How We Use Your Information</h2>
              <p className="leading-relaxed">Your information is used solely to provide and improve our subdomain service. We do not sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">3. Data Storage</h2>
              <p className="leading-relaxed">Your data is stored securely and we implement appropriate technical measures to protect against unauthorized access.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">4. Cookies</h2>
              <p className="leading-relaxed">We use essential cookies for authentication and session management. No tracking cookies are used.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">5. Third-Party Services</h2>
              <p className="leading-relaxed">We use GitHub for authentication. Please review GitHub's privacy policy for information about how they handle your data.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">6. Your Rights</h2>
              <p className="leading-relaxed">You can request deletion of your account and associated data at any time by contacting us.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 md:mb-3">7. Contact</h2>
              <p className="leading-relaxed">For privacy-related inquiries, please reach out through our GitHub repository or documentation.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;