import { useState, useEffect, useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export interface PWAStatus {
  /** Whether the app is installable */
  isInstallable: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the app is running in standalone mode */
  isStandalone: boolean;
  /** Whether the app is online */
  isOnline: boolean;
  /** Whether a service worker update is available */
  needRefresh: boolean;
  /** Whether the service worker is offline ready */
  offlineReady: boolean;
  /** Function to trigger the install prompt */
  install: () => Promise<void>;
  /** Function to update the service worker */
  updateServiceWorker: () => void;
  /** Function to close the update notification */
  closeUpdateNotification: () => void;
}

/**
 * Hook to manage PWA functionality
 * Handles service worker registration, install prompts, and offline status
 * 
 * @example
 * ```tsx
 * const { isInstallable, install, isStandalone, needRefresh, updateServiceWorker } = usePWA();
 * 
 * // Show install button if installable
 * {isInstallable && <button onClick={install}>Install App</button>}
 * 
 * // Show update notification
 * {needRefresh && <button onClick={updateServiceWorker}>Update Available</button>}
 * ```
 */
export function usePWA(): PWAStatus {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Register service worker with auto-update
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log("[PWA] Service Worker registered", r);
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Service Worker registration error", error);
    },
  });

  // Check if running in standalone mode (installed PWA)
  const isStandalone = useCallback(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("[PWA] App is installable");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      console.log("[PWA] App was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if already installed
    if (isStandalone()) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Install function
  const install = useCallback(async () => {
    if (!deferredPrompt) {
      console.log("[PWA] Install prompt not available");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstallable(false);

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
  }, [deferredPrompt]);

  const closeUpdateNotification = useCallback(() => {
    // This function is handled by the virtual:pwa-register/react hook
    // It closes the update notification
    window.location.reload();
  }, []);

  return {
    isInstallable,
    isInstalled,
    isStandalone: isStandalone(),
    isOnline,
    needRefresh,
    offlineReady,
    install,
    updateServiceWorker,
    closeUpdateNotification,
  };
}

export default usePWA;
