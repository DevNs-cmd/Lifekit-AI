"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Compass, Search, Filter, Bookmark, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryBadge } from "@/components/shared/category-badge";
import { MOCK_OPPORTUNITIES } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Opportunity, OpportunityType } from "@/types/opportunity";

const TYPE_COLORS: Record<string, string> = {
  job:         "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  internship:  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  scholarship: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  course:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  event:       "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  grant:       "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  challenge:   "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  service:     "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
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
    toast(opp?.isSaved ? "Removed from saved" : "Saved to your list");
  }

  function dismiss(id: string) {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, isDismissed: true } : o));
    toast("Opportunity dismissed");
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
          <Compass className="h-7 w-7 text-[hsl(var(--primary))]" /> Opportunities
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          AI-matched jobs, internships, scholarships, grants and more — based on your active missions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="space-y-3">
          {filtered.map(opp => (
            <Card
              key={opp.id}
              className="hover:border-[hsl(var(--primary))]/30 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => router.push(`${ROUTES.OPPORTUNITIES}/${opp.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Logo placeholder */}
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-lg font-bold text-[hsl(var(--primary))]">
                    {opp.organisation[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", TYPE_COLORS[opp.type] ?? TYPE_COLORS.service)}>
                            {opp.type}
                          </span>
                          <CategoryBadge category={opp.category} size="sm" showIcon={false} />
                          {opp.isRemote && <Badge variant="outline" className="text-[10px]">Remote</Badge>}
                        </div>
                        <h3 className="font-semibold text-[hsl(var(--text-primary))] leading-tight">{opp.title}</h3>
                        <p className="text-sm text-[hsl(var(--text-secondary))]">{opp.organisation}</p>
                      </div>

                      {/* Match score */}
                      <div className="shrink-0 text-center hidden sm:block">
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
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[hsl(var(--border))]" onClick={e => e.stopPropagation()}>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
