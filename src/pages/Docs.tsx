import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BookOpen, Terminal, Settings, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Docs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Everything you need to get started with Doofs.
          </p>
          
          <div className="space-y-8">
            <section className="border border-border rounded-lg p-6 bg-secondary/30">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Getting Started
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Sign in with your GitHub account</li>
                <li>Choose an available subdomain (e.g., yourname.doofs.tech)</li>
                <li>Configure your DNS records</li>
                <li>Point your subdomain to your server or service</li>
              </ol>
            </section>

            <section className="border border-border rounded-lg p-6 bg-secondary/30">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-accent" />
                Supported DNS Records
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">A Record:</strong> Point to an IPv4 address</li>
                <li><strong className="text-foreground">AAAA Record:</strong> Point to an IPv6 address</li>
                <li><strong className="text-foreground">CNAME Record:</strong> Alias to another domain</li>
                <li><strong className="text-foreground">TXT Record:</strong> Text records for verification</li>
                <li><strong className="text-foreground">MX Record:</strong> Mail server configuration</li>
              </ul>
            </section>

            <section className="border border-border rounded-lg p-6 bg-secondary/30">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-chart-2" />
                Common Use Cases
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Vercel/Netlify:</strong> Add a CNAME record pointing to your deployment URL</li>
                <li><strong className="text-foreground">VPS/Server:</strong> Add an A record with your server's IP address</li>
                <li><strong className="text-foreground">GitHub Pages:</strong> Add a CNAME record to your-username.github.io</li>
              </ul>
            </section>

            <section className="border border-border rounded-lg p-6 bg-secondary/30">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-chart-4" />
                Need Help?
              </h2>
              <p className="text-muted-foreground">
                Check out our <Link to="/#faq" className="text-primary hover:underline">FAQ</Link> or open an issue on our GitHub repository for support.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;