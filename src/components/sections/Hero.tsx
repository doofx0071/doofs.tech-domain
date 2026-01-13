import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Loader2, X, TriangleAlert } from "lucide-react";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Hero = () => {
  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "restricted">("idle");
  const [reason, setReason] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("doofs.tech");

  const convex = useConvex();
  const navigate = useNavigate();
  const platformDomains = useQuery(api.platformDomains.listPublic);

  useEffect(() => {
    if (platformDomains && platformDomains.length > 0) {
      // If doofs.tech is in the list, keep it as default, otherwise pick first
      const hasDoofs = platformDomains.some(d => d.domain === "doofs.tech");
      if (!hasDoofs && selectedDomain === "doofs.tech") {
        setSelectedDomain(platformDomains[0].domain);
      }
    }
  }, [platformDomains, selectedDomain]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain.trim()) return;

    // If already available, this button acts as "Claim"
    if (status === "available") {
      localStorage.setItem("claim_pending", JSON.stringify({
        subdomain,
        rootDomain: selectedDomain
      }));
      // Navigate to dashboard which should trigger auth/login if needed
      navigate("/dashboard/domains");
      return;
    }

    setStatus("checking");
    setReason("");

    try {
      const result = await convex.query(api.domains.checkAvailability, {
        subdomain: subdomain.toLowerCase(),
        rootDomain: selectedDomain
      });

      if (result.available) {
        setStatus("available");
      } else {
        if (result.reason === "Reserved") {
          setStatus("restricted");
          setReason("This name is reserved.");
        } else {
          setStatus("taken");
          setReason(result.reason || "Unavailable");
        }
      }
    } catch (err) {
      setStatus("taken");
      setReason("Error checking availability");
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    if (status !== "idle") setStatus("idle");
  };

  return (
    <section className="pt-16 sm:pt-20 md:pt-32 pb-6 sm:pb-8 md:pb-12 px-4 text-foreground relative overflow-hidden bg-background">
      {/* Top Fade Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      <div className="w-full px-2 sm:px-4 md:px-12 lg:px-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-destructive font-mono text-xs sm:text-sm font-bold tracking-wider uppercase mb-3 md:mb-4 block">
              Free domains for developers
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              ZERO COST.
              <br />
              <span className="text-accent dark:text-accent">ZERO STRINGS.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-1 md:mb-2 leading-relaxed">
              Made for <strong className="text-foreground">the world</strong>, by doof.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              100% Free forever. No hidden fees, no strings attached.
            </p>
          </motion.div>

          {/* Right side - Check availability card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-background text-foreground p-4 sm:p-5 md:p-6 border-2 border-border shadow-xl"
          >
            <h2 className="font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 md:mb-4">
              Check Availability
            </h2>
            <form onSubmit={handleCheck} className="space-y-3 md:space-y-4">
              <div className="flex border-2 border-border focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-600 relative transition-all duration-200">
                <Input
                  type="text"
                  placeholder="yourname"
                  value={subdomain}
                  onChange={handleInput}
                  className="flex-1 border-0 focus-visible:ring-0 font-mono text-sm md:text-base"
                />
                <div className="border-l-2 border-border bg-background min-w-[120px] sm:min-w-[140px]">
                  <Select value={selectedDomain} onValueChange={(val) => {
                    setSelectedDomain(val);
                    setStatus("idle");
                  }}>
                    <SelectTrigger className="border-0 focus:ring-0 font-mono text-xs sm:text-sm h-full bg-transparent rounded-none px-2 sm:px-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center truncate">
                        <span className="truncate">.{selectedDomain}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {platformDomains?.map((d: any) => (
                        <SelectItem key={d._id} value={d.domain} className="font-mono text-xs sm:text-sm">
                          .{d.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                className={`w-full gap-2 text-xs sm:text-sm md:text-base py-2 md:py-3 transition-all ${status === "available"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : status === "taken"
                    ? "bg-destructive hover:bg-destructive/90 text-white"
                    : status === "restricted"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                  }`}
                disabled={status === "checking" || !subdomain}
              >
                {status === "checking" ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    CHECKING...
                  </>
                ) : status === "available" ? (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Available! Click to Claim</span>
                    <span className="xs:hidden">DOMAIN IS AVAILABLE! CLAIM NOW</span>
                  </>
                ) : status === "taken" ? (
                  <>
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    DOMAIN ALREADY CLAIMED! TRY OTHER NAME
                  </>
                ) : status === "restricted" ? (
                  <>
                    <TriangleAlert className="h-3 w-3 sm:h-4 sm:w-4" />
                    RESTRICTED NAME! CHOOSE ANOTHER
                  </>
                ) : (
                  <>
                    <span className="hidden xs:inline">CHECK AVAILABILITY</span>
                    <span className="xs:hidden">CHECK AVAILABILITY</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Available Extensions:</p>
              <div className="flex flex-wrap gap-2">
                {platformDomains?.map((d: any) => (
                  <button
                    key={d._id}
                    onClick={() => {
                      setSelectedDomain(d.domain);
                      setStatus("idle");
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selectedDomain === d.domain
                      ? "bg-primary/10 border-primary text-primary font-medium ring-1 ring-primary/20"
                      : "bg-background border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                      }`}
                  >
                    .{d.domain}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3 md:mt-4">
              ❤️ <span className="hidden xs:inline">Help us keep this free — </span><a href="#signup" className="text-destructive hover:underline">Support us</a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
