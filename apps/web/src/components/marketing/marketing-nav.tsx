"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Product",     href: ROUTES.PRODUCT },
  { label: "Solutions",   href: ROUTES.SOLUTIONS },
  { label: "Marketplace", href: ROUTES.MARKETPLACE_PUBLIC },
  { label: "Pricing",     href: ROUTES.PRICING },
  { label: "Enterprise",  href: ROUTES.ENTERPRISE },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-200",
      "border-b border-[hsl(var(--border))] bg-white/95 shadow-sm backdrop-blur-md dark:bg-[#111713]/95",
      scrolled && "shadow-md"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight lifekit-gradient-text">LifeKit</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "text-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                  : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--secondary))]"
              )}>
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white text-[#1f6f3c] dark:bg-white dark:text-[#1f6f3c]" asChild>
              <Link href={ROUTES.SIGN_IN}>Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={ROUTES.SIGN_UP}>Get Started</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition-colors">
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <Button variant="outline" size="sm" className="flex-1" asChild><Link href={ROUTES.SIGN_IN}>Sign In</Link></Button>
                <Button size="sm" className="flex-1" asChild><Link href={ROUTES.SIGN_UP}>Get Started</Link></Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
