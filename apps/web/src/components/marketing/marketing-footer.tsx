import Link from "next/link";
import { Zap, Twitter, Linkedin, Github, Instagram } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const FOOTER_LINKS = {
  Product:    [{ l:"Features",href:ROUTES.PRODUCT},{l:"Pricing",href:ROUTES.PRICING},{l:"Changelog",href:"/changelog"},{l:"Roadmap",href:"/roadmap"}],
  Solutions:  [{ l:"Professionals",href:ROUTES.SOLUTIONS},{l:"Students",href:ROUTES.SOLUTIONS},{l:"Founders",href:ROUTES.SOLUTIONS},{l:"Families",href:ROUTES.SOLUTIONS}],
  Marketplace:[{ l:"Browse All",href:ROUTES.MARKETPLACE_PUBLIC},{l:"For Providers",href:"/providers"},{l:"Enterprise",href:ROUTES.ENTERPRISE}],
  Company:    [{ l:"About",href:ROUTES.ABOUT},{l:"Contact",href:ROUTES.CONTACT},{l:"Careers",href:"/careers"},{l:"Blog",href:"/blog"}],
  Legal:      [{ l:"Privacy",href:"/privacy"},{l:"Terms",href:"/terms"},{l:"Cookies",href:"/cookies"},{l:"Security",href:"/security"}],
};

const SOCIAL = [
  { icon: Twitter,   label:"Twitter", href:"https://twitter.com/lifekit" },
  { icon: Linkedin,  label:"LinkedIn",href:"https://linkedin.com/company/lifekit" },
  { icon: Github,    label:"GitHub",  href:"https://github.com/lifekit" },
  { icon: Instagram, label:"Instagram",href:"https://instagram.com/lifekit" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg lifekit-gradient">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg lifekit-gradient-text">LifeKit</span>
            </Link>
            <p className="mt-3 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              The AI Execution Marketplace for Human Goals. Turn intentions into achievements.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors" aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">{group}</p>
              <ul className="space-y-2">
                {links.map(({ l, href }) => (
                  <li key={l}>
                    <Link href={href} className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--text-secondary))]">© {new Date().getFullYear()} LifeKit. All rights reserved.</p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">Built with AI · Designed for humans · Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
