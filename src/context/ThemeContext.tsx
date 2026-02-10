import React, { createContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: "light" | "dark";
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme colors for PWA
const THEME_COLORS = {
  light: "#ffffff",
  dark: "#0f172a",
};

/**
 * Updates the PWA theme-color meta tag
 * This affects the browser/chrome color on mobile devices
 */
const updatePWAThemeColor = (theme: "light" | "dark") => {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", THEME_COLORS[theme]);
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored) return stored;
      return "system";
    }
    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    
    // Handle system preference
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    
    const applyTheme = () => {
      let resolved: "light" | "dark";
      
      if (theme === "system") {
        resolved = systemPrefersDark.matches ? "dark" : "light";
      } else {
        resolved = theme;
      }
      
      setResolvedTheme(resolved);
      
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      // Update PWA theme-color meta tag
      updatePWAThemeColor(resolved);
      
      localStorage.setItem("theme", theme);
    };

    applyTheme();

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme();
      }
    };

    systemPrefersDark.addEventListener("change", handleChange);
    return () => systemPrefersDark.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
