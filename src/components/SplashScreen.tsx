import { useEffect, useRef, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const videoSrc = isDarkMode
    ? "/logo-animation-dark.webm"
    : "/logo-animation-light.webm";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start playing when loaded
    const handleLoadedData = () => {
      setVideoLoaded(true);
      video.play().catch((error) => {
        console.warn("Auto-play prevented:", error);
        // If autoplay fails, still complete after a delay
        setTimeout(handleComplete, 3000);
      });
    };

    // When video ends, start fade out
    const handleEnded = () => {
      handleComplete();
    };

    // Handle video errors
    const handleError = () => {
      console.warn("Video failed to load, skipping splash screen");
      handleComplete();
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [videoSrc]);

  const handleComplete = () => {
    setIsFadingOut(true);
    // Wait for fade out animation to complete before calling onComplete
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  // Skip button for users who don't want to wait
  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isDarkMode ? "bg-black" : "bg-white"
      } ${isFadingOut ? "opacity-0" : "opacity-100"}`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        className={`w-auto h-auto max-w-[90vw] max-h-[70vh] sm:max-w-[600px] sm:max-h-[80vh] transition-opacity duration-300 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ objectFit: "contain" }}
      />

      {/* Skip button - appears after 1.5 seconds */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-6 sm:bottom-8 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 hover:opacity-80 ${
          isDarkMode
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-black/10 text-black hover:bg-black/20"
        }`}
        style={{
          animation: "fadeIn 0.5s ease-in 1.5s forwards",
          opacity: 0,
        }}
      >
        Skip
      </button>

      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
