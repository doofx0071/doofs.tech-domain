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
import { RefreshCw, Download } from "lucide-react";

interface PWAUpdatePromptProps {
  /** Delay in milliseconds before showing the update prompt */
  delay?: number;
}

/**
 * PWA Update Prompt Component
 * 
 * Shows a dialog when a service worker update is available.
 * Allows users to update the app immediately or dismiss.
 * 
 * Automatically detects dark/light mode from the theme.
 * 
 * @example
 * ```tsx
 * <PWAUpdatePrompt delay={2000} />
 * ```
 */
export function PWAUpdatePrompt({ delay = 2000 }: PWAUpdatePromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<(() => void) | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Listen for service worker messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SW_UPDATE") {
        setNeedRefresh(true);
        setUpdateServiceWorker(() => () => {
          if (event.data.payload && event.data.payload.skipWaiting) {
            event.data.payload.skipWaiting();
          }
          window.location.reload();
        });

        // Show prompt after delay
        timeoutId = setTimeout(() => {
          setIsOpen(true);
        }, delay);
      }

      if (event.data && event.data.type === "SW_OFFLINE_READY") {
        setOfflineReady(true);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    // Also check for vite-plugin-pwa's custom event
    const handleOfflineReady = () => {
      setOfflineReady(true);
    };

    const handleNeedRefresh = (event: any) => {
      setNeedRefresh(true);
      setUpdateServiceWorker(() => event.detail?.updateServiceWorker);

      timeoutId = setTimeout(() => {
        setIsOpen(true);
      }, delay);
    };

    window.addEventListener("offline-ready" as any, handleOfflineReady);
    window.addEventListener("need-refresh" as any, handleNeedRefresh);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
      window.removeEventListener("offline-ready" as any, handleOfflineReady);
      window.removeEventListener("need-refresh" as any, handleNeedRefresh);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  const handleUpdate = () => {
    if (updateServiceWorker) {
      updateServiceWorker();
    }
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  // Don't show if there's no update available
  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Update Available
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {needRefresh
              ? "A new version of doofs is available. Update now to get the latest features and improvements."
              : "doofs is ready to work offline. You can use the app even without an internet connection."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {needRefresh ? (
            <>
              <Button variant="outline" onClick={handleDismiss}>
                Later
              </Button>
              <Button onClick={handleUpdate} className="gap-2">
                <Download className="h-4 w-4" />
                Update Now
              </Button>
            </>
          ) : (
            <Button onClick={handleDismiss}>Got it</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PWAUpdatePrompt;
