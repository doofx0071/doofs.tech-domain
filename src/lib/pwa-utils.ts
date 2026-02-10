/**
 * PWA Badge and Icon Utilities
 * 
 * Utilities for updating the PWA app badge (unread count) and icons.
 * Works on supported browsers (Chrome, Edge, Safari on iOS/macOS 16.4+)
 * 
 * @example
 * ```tsx
 * import { setAppBadge, clearAppBadge, updateAppIcon } from "@/lib/pwa-utils";
 * 
 * // Set badge count
 * setAppBadge(5);
 * 
 * // Clear badge
 * clearAppBadge();
 * ```
 */

/**
 * Sets the app badge count (unread notifications/items)
 * @param count - The number to display on the badge
 * @returns Promise that resolves when the badge is set
 */
export async function setAppBadge(count?: number): Promise<void> {
  if ("setAppBadge" in navigator) {
    try {
      await (navigator as any).setAppBadge(count);
      console.log(`[PWA] Badge set to ${count ?? "(dot)"}`);
    } catch (error) {
      console.error("[PWA] Failed to set app badge:", error);
    }
  } else {
    console.log("[PWA] App badges not supported on this browser");
  }
}

/**
 * Clears the app badge
 * @returns Promise that resolves when the badge is cleared
 */
export async function clearAppBadge(): Promise<void> {
  if ("clearAppBadge" in navigator) {
    try {
      await (navigator as any).clearAppBadge();
      console.log("[PWA] Badge cleared");
    } catch (error) {
      console.error("[PWA] Failed to clear app badge:", error);
    }
  }
}

/**
 * Checks if the app is installed and running as a PWA
 * @returns boolean indicating if the app is in standalone mode
 */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Checks if the PWA API is supported
 * @returns boolean indicating if PWA features are available
 */
export function isPWASupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Gets the current install status of the PWA
 * @returns Object with install status information
 */
export function getPWAInstallStatus(): {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
} {
  const isStandalone = isRunningAsPWA();
  const isInstalled = isStandalone || localStorage.getItem("pwa-installed") === "true";
  const canInstall = !isInstalled && "beforeinstallprompt" in window;

  return {
    isInstalled,
    isStandalone,
    canInstall,
  };
}

/**
 * Updates the PWA manifest dynamically (for theme switching)
 * Note: This requires regenerating icons for the new theme
 * 
 * @param theme - The theme to apply to the manifest ('light' | 'dark')
 */
export function updateManifestTheme(theme: "light" | "dark"): void {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) return;

  const currentHref = manifestLink.getAttribute("href") || "/manifest.webmanifest";
  
  // Add theme parameter to bust cache and apply theme
  const separator = currentHref.includes("?") ? "&" : "?";
  const newHref = `${currentHref}${separator}theme=${theme}&t=${Date.now()}`;
  
  manifestLink.setAttribute("href", newHref);
  console.log(`[PWA] Manifest updated for ${theme} theme`);
}

/**
 * Triggers the PWA install prompt (if available)
 * This should be called from a user gesture (button click)
 * 
 * @returns Promise with the outcome of the install prompt
 */
export async function triggerInstallPrompt(): Promise<{ 
  outcome: "accepted" | "dismissed" | "unavailable";
  platform?: string;
}> {
  // Check for deferred prompt
  const deferredPrompt = (window as any).deferredPrompt;
  
  if (!deferredPrompt) {
    console.log("[PWA] Install prompt not available");
    return { outcome: "unavailable" };
  }

  // Show the prompt
  deferredPrompt.prompt();

  // Wait for the user to respond
  const { outcome, platform } = await deferredPrompt.userChoice;
  
  // Clear the deferredPrompt
  (window as any).deferredPrompt = null;

  if (outcome === "accepted") {
    localStorage.setItem("pwa-installed", "true");
    console.log("[PWA] User accepted install");
  } else {
    console.log("[PWA] User dismissed install");
  }

  return { outcome, platform };
}

/**
 * Updates the document title with a badge indicator
 * Fallback for browsers that don't support the Badging API
 * 
 * @param count - The count to display, or 0 to clear
 * @param originalTitle - The original document title
 */
export function updateTitleBadge(count: number, originalTitle: string): void {
  if (count > 0) {
    document.title = `(${count}) ${originalTitle}`;
  } else {
    document.title = originalTitle;
  }
}

/**
 * Handles visibility change to update badges
 * Should be called when the app becomes visible
 * 
 * @param callback - Function to call when app becomes visible
 */
export function onAppVisible(callback: () => void): () => void {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      callback();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

export default {
  setAppBadge,
  clearAppBadge,
  isRunningAsPWA,
  isPWASupported,
  getPWAInstallStatus,
  updateManifestTheme,
  triggerInstallPrompt,
  updateTitleBadge,
  onAppVisible,
};
