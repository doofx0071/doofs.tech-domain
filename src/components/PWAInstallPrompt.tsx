import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PWAInstallPromptProps {
  /** Delay in milliseconds before showing the prompt */
  delay?: number;
  /** How many times to show the prompt (stored in localStorage) */
  maxPrompts?: number;
}

/**
 * PWA Install Prompt Component
 * 
 * Shows a dialog prompting users to install the PWA when:
 * - The app is installable
 * - The user hasn't dismissed it too many times
 * - The app is not already installed
 * 
 * Automatically detects dark/light mode from the theme.
 * 
 * @example
 * ```tsx
 * <PWAInstallPrompt delay={5000} maxPrompts={3} />
 * ```
 */
export function PWAInstallPrompt({
  delay = 3000,
  maxPrompts = 3,
}: PWAInstallPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    // Check if already installed or in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Get prompt count from localStorage
    const storedCount = parseInt(
      localStorage.getItem("pwa-install-prompt-count") || "0",
      10
    );
    setPromptCount(storedCount);

    if (storedCount >= maxPrompts) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // Show prompt after delay
      setTimeout(() => {
        setIsOpen(true);
      }, delay);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [delay, maxPrompts]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted install");
    } else {
      console.log("[PWA] User dismissed install");
      // Increment prompt count
      const newCount = promptCount + 1;
      localStorage.setItem("pwa-install-prompt-count", newCount.toString());
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
    setIsOpen(false);
  };

  const handleDismiss = () => {
    // Increment prompt count when dismissed
    const newCount = promptCount + 1;
    localStorage.setItem("pwa-install-prompt-count", newCount.toString());
    setPromptCount(newCount);
    setIsOpen(false);
  };

  const handleNeverShow = () => {
    // Set to max to never show again
    localStorage.setItem("pwa-install-prompt-count", maxPrompts.toString());
    setIsOpen(false);
  };

  if (!isInstallable || promptCount >= maxPrompts) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md bg-background border-border">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Install doofs App
                </DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                Add doofs to your home screen for quick access to free domains
                and DNS management. Works offline!
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <img
                  src="/doofs.tech-lightmode-logo.png"
                  alt="doofs logo"
                  className="h-12 w-12 rounded-lg object-contain dark:hidden"
                />
                <img
                  src="/doofs.tech-darkmode-logo.png"
                  alt="doofs logo"
                  className="h-12 w-12 rounded-lg object-contain hidden dark:block"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">doofs</h4>
                  <p className="text-sm text-muted-foreground">
                    Free domains for developers
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Quick access from home screen
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Works offline
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Native app-like experience
                </li>
              </ul>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNeverShow}
                className="text-muted-foreground hover:text-foreground"
              >
                Don&apos;t show again
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDismiss}>
                  <X className="h-4 w-4 mr-2" />
                  Not now
                </Button>
                <Button onClick={handleInstall} className="gap-2">
                  <Download className="h-4 w-4" />
                  Install
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default PWAInstallPrompt;
