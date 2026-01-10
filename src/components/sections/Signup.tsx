import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Store in localStorage
    const waitlist = JSON.parse(localStorage.getItem("doofs_waitlist") || "[]");
    if (!waitlist.includes(trimmedEmail)) {
      waitlist.push(trimmedEmail);
      localStorage.setItem("doofs_waitlist", JSON.stringify(waitlist));
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <section id="signup" className="py-12 md:py-20 px-4">
      <div className="w-full px-4 md:px-12 lg:px-20">
        <div className="border-2 border-border bg-card p-5 sm:p-6 md:p-8 lg:p-12 shadow-xs">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4">
            Get early access
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 md:mb-8">
            Join the waitlist and be the first to claim your subdomain.
          </p>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-4 md:px-6 bg-secondary border-2 border-border">
              <Check className="h-4 w-4 md:h-5 md:w-5 text-chart-2 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Thanks! You're on the waitlist.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 font-mono"
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p id="email-error" className="mt-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request access"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
