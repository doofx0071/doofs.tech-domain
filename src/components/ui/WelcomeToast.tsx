import { useEffect, useState } from "react";
import { CheckCircle, Sparkles } from "lucide-react";

interface WelcomeToastProps {
  isNewUser: boolean;
  userName?: string;
  onClose: () => void;
}

export function WelcomeToast({ isNewUser, userName, onClose }: WelcomeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide down animation
    setTimeout(() => setIsVisible(true), 100);

    // Start exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Remove component after exit animation completes
    const removeTimer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${
        isVisible && !isExiting
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-accent via-accent/90 to-accent text-accent-foreground shadow-2xl rounded-lg px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-md border-2 border-accent/20">
        <div className="flex-shrink-0">
          {isNewUser ? (
            <Sparkles className="h-6 w-6 animate-pulse" />
          ) : (
            <CheckCircle className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">
            {isNewUser ? "Welcome!" : "Welcome Back!"}
          </h3>
          <p className="text-sm opacity-90">
            {isNewUser
              ? userName
                ? `Great to have you here, ${userName}!`
                : "Great to have you here!"
              : userName
              ? `Nice to see you again, ${userName}!`
              : "Nice to see you again!"}
          </p>
        </div>
      </div>
    </div>
  );
}
