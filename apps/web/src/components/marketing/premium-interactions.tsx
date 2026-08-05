"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUp, ChevronDown, Clock3, Search } from "lucide-react";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: reduced ? 0 : 0.26, delay: reduced ? 0 : delay }}>
      {children}
    </motion.div>
  );
}

export type LegalSection = { title: string; content: ReactNode; searchText: string; important?: boolean };

export function LegalExplorer({ sections }: { sections: LegalSection[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>([sections[0]?.title ?? ""]);
  const [showTop, setShowTop] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 620);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const filtered = useMemo(() => sections.filter((s) => `${s.title} ${s.searchText}`.toLowerCase().includes(query.toLowerCase())), [query, sections]);
  const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const toggle = (title: string) => setOpen((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);

  return (
    <>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[80] h-1 origin-left bg-[hsl(var(--primary))]" style={{ scaleX: reduced ? 0 : scrollYProgress }} />
      <div className="legal-explorer-grid">
        <aside className="legal-toc">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--text-secondary))]"><Clock3 className="h-4 w-4" /> About {Math.max(3, Math.ceil(sections.reduce((n, s) => n + s.searchText.split(/\s+/).length, 0) / 210))} min read</div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]">On this page</p>
          <nav className="space-y-1" aria-label="Document sections">{sections.map((section) => <a key={section.title} href={`#${slug(section.title)}`} className="legal-toc-link">{section.title}</a>)}</nav>
        </aside>
        <div>
          <label className="legal-search"><Search className="h-4 w-4" /><span className="sr-only">Search this document</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this document…" /></label>
          <div className="space-y-3">
            {filtered.map((section, index) => {
              const expanded = open.includes(section.title) || query.length > 0;
              return <Reveal key={section.title} delay={Math.min(index * .025, .15)}>
                <section id={slug(section.title)} className={`legal-section-card scroll-mt-28 ${section.important ? "legal-section-important" : ""}`}>
                  <button type="button" className="legal-section-trigger" onClick={() => toggle(section.title)} aria-expanded={expanded}>
                    <span>{section.title}</span><ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>{expanded && <motion.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .22 }} className="overflow-hidden"><div className="legal-section-content">{section.content}</div></motion.div>}</AnimatePresence>
                </section>
              </Reveal>;
            })}
            {!filtered.length && <div className="legal-empty"><Search className="h-8 w-8" /><p>No clauses match “{query}”.</p><button onClick={() => setQuery("")}>Clear search</button></div>}
          </div>
        </div>
      </div>
      <AnimatePresence>{showTop && <motion.button initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .9 }} transition={{ duration: .18 }} className="legal-back-top" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })} aria-label="Back to top"><ArrowUp className="h-4 w-4" /></motion.button>}</AnimatePresence>
    </>
  );
}
