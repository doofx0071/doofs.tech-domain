import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Separator } from "@/components/ui/separator";
import { Lock, Eye, Server, Cookie, UserCheck, ShieldCheck } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              Last Updated: January 10, 2026
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="lead text-xl text-muted-foreground">
              We value your privacy. This policy explains what information we collect, how we use it, and how we protect it.
              By using Doofs.tech, you agree to the collection and use of information in accordance with this policy.
            </p>

            <Separator className="my-10" />

            <section className="space-y-8">

              {/* Information Collection */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Eye className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mt-0">1. Information We Collect</h3>
                  <p>
                    We collect the minimal amount of data necessary to operate our service:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Account Information:</strong> When you sign up via GitHub, we store your GitHub User ID, Username, Email Address (if public or provided), and Avatar URL.</li>
                    <li><strong>Service Usage Data:</strong> We collect logs including IP addresses, browser user agents, and timestamps for security and abuse prevention.</li>
                    <li><strong>DNS Configuration:</strong> We store the DNS records and domain configurations you create to propagate them to our DNS providers.</li>
                  </ul>
                </div>
              </div>

              {/* Usage */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mt-0">2. How We Use Your Information</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>To provide and maintain the Service (e.g., routing DNS traffic).</li>
                    <li>To notify you about changes to our Service.</li>
                    <li>To detect, prevent, and address technical issues and abuse (e.g., spam/phishing detection).</li>
                    <li>To enforce our Terms of Service.</li>
                  </ul>
                </div>
              </div>

              {/* Third Parties */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Server className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mt-0">3. Third-Party Service Providers</h3>
                  <p>We use trusted third-party providers to operate our infrastructure, including services for database hosting, DNS resolution, and authentication.</p>
                </div>
              </div>

              {/* Cookies */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Cookie className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mt-0">4. Cookies & Tracking</h3>
                  <p>
                    We use essential cookies solely for authentication and session management. We do not use third-party tracking cookies or sell your browsing data to advertisers.
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-xl mt-8">
                <h3 className="mt-0 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Your Rights
                </h3>
                <p className="mb-2">
                  You have the right to access, correct, or delete your personal data. You can delete your account and all associated data directly from the Dashboard.
                </p>
                <p className="mb-0">
                  If you have concerns about your data, please contact us via our <a href="/contact" className="underline">Contact page</a>.
                </p>
              </div>

            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;