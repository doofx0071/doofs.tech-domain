import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import logoLight from "@/assets/doofs-logo-light.svg";
import logoDark from "@/assets/doofs-logo-dark.svg";
import { motion } from "framer-motion";

export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="py-8 px-4 border-t-2 border-border">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full px-4 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <a href="/" className="flex items-center gap-2 font-mono text-sm">
          <img
            key={theme}
            src={theme === "dark" ? logoDark : logoLight}
            alt="doofs.tech logo"
            className="h-6 w-auto"
          />
          <span className="font-bold">doofs<span className="text-muted-foreground">.tech</span></span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Domains</span>
        </a>
        <nav className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <Link
            to="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            to="/docs"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
        </nav>
      </motion.div>
    </footer>
  );
};
