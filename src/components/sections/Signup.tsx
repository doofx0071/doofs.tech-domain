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
    <section id="signup" className="py-20 px-4">
      <div className="w-full px-4 md:px-12 lg:px-20">
        <div className="border-2 border-border bg-card p-8 md:p-12 shadow-xs">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Get early access
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Join the waitlist and be the first to claim your subdomain.
          </p>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-secondary border-2 border-border">
              <Check className="h-5 w-5 text-chart-2" />
              <span className="font-medium">Thanks! You're on the waitlist.</span>
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
