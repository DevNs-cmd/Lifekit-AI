"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Bookmark, ExternalLink, CheckCircle,
  Calendar, MapPin, Building2, Plus, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ROUTES } from "@/constants/routes";
import { formatDeadline, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { opportunitiesApi } from "@/lib/api";
import type { Opportunity } from "@/types/opportunity";

// ─── Curated fallback data keyed by id ────────────────────────────────────────
// If the API can't return the opportunity (e.g. it's a static/demo id from the
// list page), we look it up here so the detail page never breaks.
const FALLBACK_MAP: Record<string, Opportunity> = {
  "opp-fallback-1": {
    id: "opp-fallback-1",
    title: "Senior Software Engineer — Remote",
    organisation: "TechCorp",
    type: "job",
    category: "career",
    location: "Remote",
    isRemote: true,
    deadline: "2026-09-30",
    eligibilitySummary: "3+ years experience with React and Node.js",
    description:
      "Join our engineering team building high-impact products used by millions. You'll work on our core platform, collaborating closely with product and design.",
    requirements: [
      { label: "React.js", description: "3+ years of hands-on experience" },
      { label: "Node.js", description: "Solid backend experience" },
      { label: "TypeScript", description: "Strong typing practices" },
    ],
    requiredDocuments: ["Resume", "Portfolio", "Cover letter (optional)"],
    applicationUrl: "https://example.com/careers",
    experienceLevel: "mid",
    matchScore: 88,
    matchReasons: ["Matches your career mission", "Remote role fits your preference", "Tech stack aligns with your skills"],
    isSaved: false,
    isDismissed: false,
    applicationStatus: "not-applied",
    tags: ["remote", "full-stack", "typescript"],
    postedAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
  "opp-fallback-2": {
    id: "opp-fallback-2",
    title: "Google Generation Scholarship 2026",
    organisation: "Google",
    type: "scholarship",
    category: "education",
    location: "India",
    isRemote: false,
    deadline: "2026-09-15",
    eligibilitySummary: "Undergraduate students in Computer Science or related field",
    description:
      "A scholarship for students demonstrating leadership and academic excellence in technology fields. Winners receive financial support and mentorship.",
    requirements: [
      { label: "GPA", description: "3.5+ or equivalent" },
      { label: "Essay", description: "500-word leadership essay" },
    ],
    requiredDocuments: ["Transcripts", "Essay", "Recommendation letter"],
    applicationUrl: "https://buildyourfuture.withgoogle.com/scholarships",
    experienceLevel: "entry",
    matchScore: 78,
    matchReasons: ["Matches education goal", "Supports career mission"],
    isSaved: false,
    isDismissed: false,
    applicationStatus: "not-applied",
    tags: ["scholarship", "students", "tech"],
    postedAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
  "opp-fallback-3": {
    id: "opp-fallback-3",
    title: "Startup India Seed Fund",
    organisation: "DPIIT — Startup India",
    type: "grant",
    category: "business",
    location: "India",
    isRemote: false,
    deadline: "2026-10-01",
    eligibilitySummary: "Early-stage Indian startups with innovative product ideas",
    description:
      "Government grant of up to ₹20 lakh for early-stage startups incorporated for less than 2 years. Focus on technology-based innovative solutions.",
    requirements: [
      { label: "Incorporation", description: "< 2 years old" },
      { label: "Innovation", description: "Technology-based product" },
    ],
    requiredDocuments: ["Business plan", "Incorporation certificate", "Financial projections"],
    applicationUrl: "https://seedfund.startupindia.gov.in",
    experienceLevel: "any",
    matchScore: 72,
    matchReasons: ["Supports your business goal"],
    isSaved: false,
    isDismissed: false,
    applicationStatus: "not-applied",
    tags: ["grant", "startup", "india"],
    postedAt: "2026-07-05T10:00:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Try numeric IDs (real API records) first
        const numericId = Number(id);
        if (!isNaN(numericId)) {
          const data = await opportunitiesApi.getOpportunity(numericId);
          setOpp(data);
          setSaved(data.isSaved);
          return;
        }
        throw new Error("non-numeric id");
      } catch {
        // Fall back to local fallback map for demo/static ids
        const fallback = FALLBACK_MAP[id] ?? null;
        setOpp(fallback);
        setSaved(fallback?.isSaved ?? false);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  function handleSave() {
    setSaved((v) => !v);
    toast(saved ? "Removed from saved" : "Saved to your list");
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">
        Loading opportunity…
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Compass className="h-8 w-8" />}
          title="Opportunity not found"
          description="This opportunity may have been removed or the link is invalid."
          action={{ label: "Back to Opportunities", onClick: () => router.push(ROUTES.OPPORTUNITIES) }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => router.push(ROUTES.OPPORTUNITIES)}
      >
        Back to Opportunities
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-2xl font-bold text-[hsl(var(--primary))]">
              {opp.organisation[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {opp.type}
                </span>
                <CategoryBadge category={opp.category} size="sm" />
                {opp.isRemote && <Badge variant="outline">Remote</Badge>}
              </div>
              <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">{opp.title}</h1>
              <p className="text-[hsl(var(--text-secondary))] flex items-center gap-1.5 mt-1">
                <Building2 className="h-4 w-4" />
                {opp.organisation}
              </p>
            </div>
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--text-secondary))]">
            {opp.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {opp.location}
              </span>
            )}
            {opp.deadline && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <Calendar className="h-4 w-4" />
                Deadline: {formatDeadline(opp.deadline)}
              </span>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">
                About this opportunity
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                {opp.description}
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">
                Eligibility
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
                {opp.eligibilitySummary}
              </p>
              {opp.requirements.length > 0 && (
                <ul className="space-y-2">
                  {opp.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] mt-0.5 shrink-0" />
                      <span>
                        <span className="font-medium text-[hsl(var(--text-primary))]">{r.label}</span>
                        {r.description && (
                          <span className="text-[hsl(var(--text-secondary))]"> — {r.description}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Required documents */}
          {opp.requiredDocuments.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">
                  Required documents
                </h2>
                <ul className="space-y-1.5">
                  {opp.requiredDocuments.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* AI preparation */}
          <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--primary))] mb-3">
                ✦ AI Preparation Suggestions
              </h2>
              <ul className="space-y-2">
                {[
                  "Update your resume to highlight relevant experience",
                  "Write a strong personal statement focusing on your goal",
                  "Prepare required documents at least 2 weeks before the deadline",
                  "Set a reminder 1 week before the application closes",
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--text-secondary))]">
                    <span className="font-bold text-[hsl(var(--primary))] shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Match score */}
          <Card className="border-[hsl(var(--primary))]/30">
            <CardContent className="p-4 text-center">
              <div
                className={cn(
                  "mx-auto h-16 w-16 rounded-full flex items-center justify-center text-xl font-black border-4 mb-3",
                  opp.matchScore >= 85
                    ? "border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20"
                    : "border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                {opp.matchScore}%
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Match score</p>
              {opp.relatedMissionTitle && (
                <p className="text-xs text-[hsl(var(--primary))] mt-1">🎯 {opp.relatedMissionTitle}</p>
              )}
              {opp.matchReasons.length > 0 && (
                <div className="mt-3 space-y-1">
                  {opp.matchReasons.map((r, i) => (
                    <p
                      key={i}
                      className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3 text-[hsl(var(--success))] shrink-0" />
                      {r}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {opp.applicationUrl && (
              <Button
                className="w-full"
                rightIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open(opp.applicationUrl, "_blank")}
              >
                Apply Now
              </Button>
            )}
            <Button
              variant={saved ? "secondary" : "outline"}
              className="w-full"
              leftIcon={<Bookmark className={cn("h-4 w-4", saved && "fill-current")} />}
              onClick={handleSave}
            >
              {saved ? "Saved" : "Save Opportunity"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => toast.success("Application tasks added to your missions!")}
            >
              Add Application Tasks
            </Button>
          </div>

          {/* Details */}
          <Card>
            <CardContent className="p-4 space-y-2.5 text-sm">
              <p className="font-semibold text-[hsl(var(--text-primary))] mb-1">Details</p>
              {[
                { label: "Organisation", value: opp.organisation },
                { label: "Type", value: opp.type },
                { label: "Location", value: opp.location ?? "Not specified" },
                { label: "Remote", value: opp.isRemote ? "Yes" : "No" },
                { label: "Experience", value: opp.experienceLevel ?? "Any" },
                { label: "Posted", value: formatDate(opp.postedAt) },
                ...(opp.deadline ? [{ label: "Deadline", value: formatDate(opp.deadline) }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[hsl(var(--text-secondary))]">{label}</span>
                  <span className="font-medium text-[hsl(var(--text-primary))] text-right capitalize">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
