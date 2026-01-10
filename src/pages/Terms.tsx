import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, FileText, Gavel, Scale, Ban } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last Updated: January 10, 2026
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="bg-muted/30 border border-border rounded-xl p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mt-0">
                <Shield className="h-5 w-5 text-primary" /> Agreement Highlights
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4 mt-4 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="bg-green-500/10 text-green-600 dark:text-green-400 p-1 rounded mt-0.5">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="text-sm">Usage is free for developers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-500/10 text-red-600 dark:text-red-400 p-1 rounded mt-0.5">
                    <Ban className="h-4 w-4" />
                  </span>
                  <span className="text-sm">Zero tolerance for phishing or malware.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1 rounded mt-0.5">
                    <Gavel className="h-4 w-4" />
                  </span>
                  <span className="text-sm">We may revoke domains for abuse.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-1 rounded mt-0.5">
                    <Scale className="h-4 w-4" />
                  </span>
                  <span className="text-sm">Service is provided "AS IS".</span>
                </li>
              </ul>
            </div>

            <Separator className="my-10" />

            <section className="space-y-6">
              <h3>1. Service Description</h3>
              <p>
                Doofs.tech ("we", "our", or "Service") provides free subdomain registration and DNS management services (e.g., <code>yourname.doofs.tech</code>).
                The Service is intended for developers, hobbyists, and open-source projects.
              </p>

              <h3>2. Eligibility & Account</h3>
              <p>
                To use the Service, you must authenticate via a valid GitHub account. You are responsible for maintaining the security of your account and for all activities that occur under your account.
              </p>

              <h3>3. Acceptable Use Policy (AUP)</h3>
              <p>
                You agree NOT to use the Service for any of the following:
              </p>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm">
                <ul className="list-disc list-inside space-y-1 mt-0">
                  <li><strong>Phishing & Scamming:</strong> Hosting social engineering sites or deceptive content.</li>
                  <li><strong>Malware Distribution:</strong> Hosting viruses, worms, trojans, or spyware.</li>
                  <li><strong>Illegal Content:</strong> Hosting child sexual abuse material (CSAM), promoting violence, or other illegal acts.</li>
                  <li><strong>Spam:</strong> Sending unsolicited bulk emails or hosting spam link farms.</li>
                  <li><strong>Copyright Infringement:</strong> Hosting content that violates third-party intellectual property rights.</li>
                </ul>
              </div>
              <p>
                <strong>Violation of this AUP will result in immediate termination of your account and subdomains without notice.</strong> We cooperate with law enforcement and security vendors to report abuse.
              </p>

              <h3>4. Subdomain Ownership & Rights</h3>
              <p>
                You acknowledge that you do not own the subdomains (e.g., <code>user.doofs.tech</code>). You are granted a revocable, non-exclusive license to use the subdomain while your account is active and in good standing.
                We reserve the right to reclaim, suspend, or block any subdomain at our sole discretion, including for trademark disputes or inactivity.
              </p>

              <h3>5. Warranty Disclaimer</h3>
              <p className="text-muted-foreground italic">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>

              <h3>6. Limitation of Liability</h3>
              <p>
                IN NO EVENT SHALL DOOFS.TECH BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF YOUR USE OF THE SERVICE.
              </p>

              <h3>7. Modifications to Service</h3>
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
              </p>

              <h3>8. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;