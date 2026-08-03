"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Compass, Search, Bookmark, X, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryBadge } from "@/components/shared/category-badge";
import { SideSheet } from "@/components/ui/side-sheet";
import { MOCK_OPPORTUNITIES } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Opportunity, OpportunityType } from "@/types/opportunity";

const TYPE_STYLES: Record<string, React.CSSProperties> = {
  job: { backgroundColor: "#edf3ff", color: "#315a9b" },
  internship: { backgroundColor: "#f3effb", color: "#65508f" },
  scholarship: { backgroundColor: "#fff3e9", color: "#925a2f" },
  course: { backgroundColor: "#eaf5ef", color: "#267052" },
  event: { backgroundColor: "#eaf7fa", color: "#277083" },
  grant: { backgroundColor: "#fff3e9", color: "#925a2f" },
  challenge: { backgroundColor: "#fff0f4", color: "#984d68" },
  service: { backgroundColor: "#f1f2ef", color: "#545b57" },
};

// Extend mock data with more entries for a realistic feed
const EXTENDED_OPPORTUNITIES: Opportunity[] = [
  ...MOCK_OPPORTUNITIES,
  {
    id: "opp-2",
    title: "Full-Stack Developer — Remote",
    organisation: "Zepto",
    type: "job",
    category: "career",
    location: "Remote",
    isRemote: true,
    deadline: "2025-08-30",
    eligibilitySummary: "2+ years experience with React and Node.js",
    description: "Join Zepto's engineering team as a full-stack developer working on high-impact consumer products.",
    requirements: [{ label: "React.js", description: "2+ years" }, { label: "Node.js", description: "Backend experience" }],
    requiredDocuments: ["Resume", "Portfolio"],
    applicationUrl: "https://zepto.com/careers",
    experienceLevel: "mid",
    matchScore: 85,
    relatedMissionId: "mission-1",
    relatedMissionTitle: "Become a Software Engineer",
    matchReasons: ["Matches career mission", "Remote role fits your preference"],
    isSaved: false,
    isDismissed: false,
    applicationStatus: "not-applied",
    tags: ["remote", "full-stack"],
    postedAt: "2025-07-18T10:00:00Z",
    updatedAt: "2025-07-20T10:00:00Z",
  },
  {
    id: "opp-3",
    title: "Google Generation Scholarship 2025",
    organisation: "Google",
    type: "scholarship",
    category: "education",
    location: "India",
    isRemote: false,
    deadline: "2025-09-15",
    eligibilitySummary: "Undergraduate students in Computer Science or related field",
    description: "A scholarship for students demonstrating leadership and academic excellence in technology fields.",
    requirements: [{ label: "GPA", description: "3.5+ or equivalent" }, { label: "Essay", description: "500-word leadership essay" }],
    requiredDocuments: ["Transcripts", "Essay", "Recommendation letter"],
    applicationUrl: "https://buildyourfuture.withgoogle.com/scholarships",
    experienceLevel: "entry",
    matchScore: 78,
    relatedMissionId: "mission-1",
    relatedMissionTitle: "Become a Software Engineer",
    matchReasons: ["Matches education goal", "Supports career mission"],
    isSaved: true,
    isDismissed: false,
    applicationStatus: "saved",
    tags: ["scholarship", "students", "tech"],
    postedAt: "2025-07-10T10:00:00Z",
    updatedAt: "2025-07-20T10:00:00Z",
  },
  {
    id: "opp-4",
    title: "Startup India Seed Fund",
    organisation: "DPIIT — Startup India",
    type: "grant",
    category: "business",
    location: "India",
    isRemote: false,
    deadline: "2025-10-01",
    eligibilitySummary: "Early-stage Indian startups with innovative product ideas",
    description: "Government grant of up to ₹20 lakh for early-stage startups incorporated for less than 2 years.",
    requirements: [{ label: "Incorporation", description: "< 2 years old" }, { label: "Innovation", description: "Technology-based product" }],
    requiredDocuments: ["Business plan", "Incorporation certificate", "Financial projections"],
    applicationUrl: "https://seedfund.startupindia.gov.in",
    experienceLevel: "any",
    matchScore: 72,
    matchReasons: ["Supports business goal"],
    isSaved: false,
    isDismissed: false,
    applicationStatus: "not-applied",
    tags: ["grant", "startup", "india"],
    postedAt: "2025-07-05T10:00:00Z",
    updatedAt: "2025-07-20T10:00:00Z",
  },
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>(EXTENDED_OPPORTUNITIES);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<OpportunityType | "all">("all");
  const [savedOnly, setSavedOnly] = React.useState(false);
  const [previewOpportunity, setPreviewOpportunity] = React.useState<Opportunity | null>(null);

  const filtered = opportunities.filter((o) => {
    if (o.isDismissed) return false;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.organisation.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || o.type === typeFilter;
    const matchSaved = !savedOnly || o.isSaved;
    return matchSearch && matchType && matchSaved;
  }).sort((a, b) => b.matchScore - a.matchScore);

  function toggleSave(id: string) {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, isSaved: !o.isSaved, applicationStatus: !o.isSaved ? "saved" : "not-applied" } : o));
    const opp = opportunities.find(o => o.id === id);
    toast(opp?.isSaved ? "Removed from saved" : "Saved to your list", { action: { label: "Undo", onClick: () => setOpportunities(prev => prev.map(o => o.id === id ? { ...o, isSaved: !!opp?.isSaved, applicationStatus: opp?.applicationStatus ?? "not-applied" } : o)) } });
  }

  function dismiss(id: string) {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, isDismissed: true } : o));
    const dismissed = opportunities.find(o => o.id === id);
    toast("Opportunity dismissed", { action: { label: "Undo", onClick: () => { setOpportunities(prev => prev.map(o => o.id === id ? { ...o, isDismissed: false } : o)); if (dismissed) setPreviewOpportunity(dismissed); } } });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--primary))]"><Sparkles className="h-3.5 w-3.5" />Matched for your goals</div>
        <h1 className="text-3xl font-black tracking-[-0.035em] text-[hsl(var(--text-primary))]">Opportunities</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          AI-matched jobs, internships, scholarships, grants and more — based on your active missions.
        </p>
      </div>

      {/* Filters */}
      <div className="premium-surface flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities…" className="pl-9" aria-label="Search opportunities" />
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as OpportunityType | "all")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(["job","internship","scholarship","course","event","grant","challenge"] as OpportunityType[]).map(t => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={savedOnly ? "default" : "outline"}
          size="sm"
          leftIcon={<Bookmark className="h-4 w-4" />}
          onClick={() => setSavedOnly(v => !v)}
        >
          Saved
        </Button>
      </div>

      {/* Results count */}
      <p className="text-xs text-[hsl(var(--text-secondary))]">
        {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"} found
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-8 w-8" />}
          title="No opportunities found"
          description="Try adjusting your filters, or complete more mission tasks to unlock better matches."
          action={{ label: "Clear filters", onClick: () => { setSearch(""); setTypeFilter("all"); setSavedOnly(false); } }}
        />
      ) : (
        <motion.div layout className="dense-work-surface grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
          {filtered.map(opp => (
            <motion.div key={opp.id} layout layoutId={`opportunity-${opp.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .22 }}>
            <Card
              className="group h-full overflow-hidden hover:border-[hsl(var(--primary))]/30"
              onClick={() => setPreviewOpportunity(opp)}
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex flex-1 items-start gap-4">
                  {/* Logo placeholder */}
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-lg font-bold text-[hsl(var(--primary))]">
                    {opp.organisation[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span style={TYPE_STYLES[opp.type] ?? TYPE_STYLES.service} className="border border-black/[0.04] px-2 py-0.5 text-xs font-semibold rounded-full capitalize dark:!bg-[hsl(var(--muted))] dark:!text-[hsl(var(--foreground))]">
                            {opp.type}
                          </span>
                          <CategoryBadge category={opp.category} size="sm" showIcon={false} />
                          {opp.isRemote && <Badge variant="outline" className="text-[10px]">Remote</Badge>}
                        </div>
                        <h3 className="font-semibold text-[hsl(var(--text-primary))] leading-tight">{opp.title}</h3>
                        <p className="text-sm text-[hsl(var(--text-secondary))]">{opp.organisation}</p>
                      </div>

                      {/* Match score */}
                      <div className="shrink-0 text-center hidden sm:block rounded-xl bg-[hsl(var(--background-subtle))] p-1.5">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2",
                          opp.matchScore >= 85 ? "border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20" :
                          opp.matchScore >= 70 ? "border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20" :
                          "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]"
                        )}>
                          {opp.matchScore}%
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">match</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[hsl(var(--text-secondary))]">
                      {opp.location && <span>📍 {opp.location}</span>}
                      {opp.deadline && <span className="text-amber-600 dark:text-amber-400 font-medium">🗓 {formatDeadline(opp.deadline)}</span>}
                      {opp.relatedMissionTitle && (
                        <span className="text-[hsl(var(--primary))]">🎯 {opp.relatedMissionTitle}</span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-[hsl(var(--text-secondary))] line-clamp-1">{opp.eligibilitySummary}</p>

                    {/* Why it matches */}
                    {opp.matchReasons.length > 0 && (
                      <p className="mt-1.5 text-xs text-[hsl(var(--primary))]">
                        ✦ {opp.matchReasons[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2 border-t border-[hsl(var(--border))] pt-3" onClick={e => e.stopPropagation()}>
                  <Button
                    size="xs"
                    variant={opp.isSaved ? "secondary" : "outline"}
                    leftIcon={<Bookmark className={cn("h-3 w-3", opp.isSaved && "fill-current")} />}
                    onClick={() => toggleSave(opp.id)}
                  >
                    {opp.isSaved ? "Saved" : "Save"}
                  </Button>
                  <Button size="xs" onClick={() => router.push(`${ROUTES.OPPORTUNITIES}/${opp.id}`)}>
                    View Details
                  </Button>
                  {opp.applicationUrl && (
                    <Button size="xs" variant="ghost" rightIcon={<ExternalLink className="h-3 w-3" />}
                      onClick={() => window.open(opp.applicationUrl, "_blank")}>
                      Apply
                    </Button>
                  )}
                  <Button size="xs" variant="ghost" className="ml-auto text-[hsl(var(--text-secondary))]"
                    onClick={() => dismiss(opp.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[hsl(var(--primary))] opacity-0 transition-opacity group-hover:opacity-100">Quick preview · full details available</p>
              </CardContent>
            </Card>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      )}
      <SideSheet
        open={!!previewOpportunity}
        onOpenChange={open => !open && setPreviewOpportunity(null)}
        title={previewOpportunity?.title ?? "Opportunity"}
        description={previewOpportunity && `${previewOpportunity.organisation} · ${previewOpportunity.matchScore}% match`}
        footer={previewOpportunity && <><Button variant="outline" onClick={() => toggleSave(previewOpportunity.id)} leftIcon={<Bookmark className="h-4 w-4" />}>{previewOpportunity.isSaved ? "Unsave" : "Save"}</Button><Button onClick={() => router.push(`${ROUTES.OPPORTUNITIES}/${previewOpportunity.id}`)}>Open full details</Button></>}
      >
        {previewOpportunity && <div className="space-y-5">
          <div className="flex flex-wrap gap-2"><Badge className="capitalize">{previewOpportunity.type}</Badge><CategoryBadge category={previewOpportunity.category} />{previewOpportunity.isRemote && <Badge variant="outline">Remote</Badge>}</div>
          <p className="text-sm leading-6 text-[hsl(var(--text-secondary))]">{previewOpportunity.description}</p>
          <div className="rounded-2xl bg-[hsl(var(--secondary))] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Why it matches</p><ul className="mt-2 space-y-2 text-sm">{previewOpportunity.matchReasons.map(reason => <li key={reason}>✦ {reason}</li>)}</ul></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Requirements</p><div className="mt-2 space-y-2">{previewOpportunity.requirements.map(req => <div key={req.label} className="rounded-xl border border-[hsl(var(--border))] p-3"><strong className="text-sm">{req.label}</strong><p className="text-xs text-[hsl(var(--text-secondary))]">{req.description}</p></div>)}</div></div>
        </div>}
      </SideSheet>
    </div>
  );
}
