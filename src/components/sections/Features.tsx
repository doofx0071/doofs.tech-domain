import { Terminal, Globe, Shield, Zap, Settings, Code2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Features = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden" id="features">
      {/* Background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black mb-6 tracking-tight font-poppins"
          >
            Everything you need to <span className="text-primary">ship</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A complete toolkit for developers who want to experiment, build, and deploy without the hassle.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

          {/* 1. API Access (Hero Card - Large) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 row-span-2 group relative overflow-hidden rounded-3xl border bg-card p-8 flex flex-col justify-between"
          >
            {/* Spotlight Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Code2 className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">API Access</h3>
                  <span className="text-[10px] font-mono font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">
                    LIVE
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">
                Full programmatic control. Create, update, and manage your domains directly from your CLI or CI/CD pipeline.
              </p>
            </div>

            {/* Code Snippet Visual */}
            <div className="relative z-10 mt-auto rounded-xl bg-[#0d1117] border border-white/10 p-4 font-mono text-sm shadow-2xl group-hover:translate-y-[-5px] transition-transform duration-300">
              <div className="flex gap-1.5 mb-3 absolute top-3 left-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
              <div className="pt-4 text-xs md:text-sm overflow-x-auto text-blue-400">
                <span className="text-purple-400">curl</span> -X POST https://api.doofs.tech/v1/domains \<br />
                <span className="pl-4 text-muted-foreground"> -H "Authorization: Bearer sk_..." \</span><br />
                <span className="pl-4 text-green-400"> -d '{"{"}"name": "my-app", "target": "1.2.3.4"{"}"}'</span>
              </div>
            </div>
          </motion.div>

          {/* 2. DNS Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 row-span-2 group relative overflow-hidden rounded-3xl border bg-card p-6 flex flex-col"
          >
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Full DNS Control</h3>
            <p className="text-muted-foreground text-sm mb-6">Manage A, CNAME, TXT, and MX records with ease.</p>

            {/* Visual */}
            <div className="mt-auto space-y-2 relative z-10">
              {['A', 'CNAME', 'TXT', 'MX'].map((record, i) => (
                <div key={record} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border text-xs font-mono group-hover:scale-105 transition-transform origin-left" style={{ transitionDelay: `${i * 50}ms` }}>
                  <span className="font-bold">{record}</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3. Free Subdomains */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 group relative overflow-hidden rounded-3xl border bg-card p-6"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Free Forever</h3>
            <p className="text-sm text-muted-foreground">Claim your domain at zero cost.</p>
          </motion.div>

          {/* 4. Instant Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 group relative overflow-hidden rounded-3xl border bg-card p-6 flex flex-col justify-center items-center text-center"
          >
            <div className="h-16 w-16 mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-black font-mono">Instant</h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">Global Propagation</p>
          </motion.div>

          {/* 5. Abuse Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 group relative overflow-hidden rounded-3xl border bg-card p-6"
          >
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure</h3>
            <p className="text-sm text-muted-foreground">Built-in abuse protection and rate limiting.</p>
          </motion.div>

          {/* 6. Terminal / Dev Focused */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 group relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-4 w-full md:max-w-[60%]">
              <div className="flex items-center gap-2 text-primary">
                <Terminal className="h-5 w-5" />
                <span className="font-bold text-sm uppercase tracking-wider">Built for Developers</span>
              </div>
              <h3 className="text-2xl font-bold">Ready to build?</h3>
              <p className="text-muted-foreground">Read the docs and get started in seconds.</p>
            </div>
            <Button variant="default" size="lg" className="w-full md:w-auto shrink-0" asChild>
              <Link to="/docs">View Docs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
