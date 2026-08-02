import Link from "next/link";
import { Zap, Twitter, Linkedin, Github, Instagram } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const SOCIAL = [
  { icon: Twitter,   label: "Twitter",   href: "https://twitter.com/lifekit" },
  { icon: Linkedin,  label: "LinkedIn",  href: "https://linkedin.com/company/lifekit" },
  { icon: Github,    label: "GitHub",    href: "https://github.com/lifekit" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/lifekit" },
];

const LEGAL_LINKS = [
  { label: "Terms",    href: "/terms" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg lifekit-gradient-text">LifeKit</span>
          </Link>

          {/* Tagline — hidden on mobile */}
          <p className="hidden md:block text-sm text-[hsl(var(--text-secondary))] text-center">
            The AI Execution Marketplace for Human Goals.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            © {new Date().getFullYear()} LifeKit. All rights reserved. · Built with AI · Made in India 🇮🇳
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
