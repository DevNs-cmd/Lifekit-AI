/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type { Opportunity } from "@/types/opportunity";

// ─── Backend → Frontend mapper ────────────────────────────────────────────────
// The backend `opportunities` table has: opportunity_id, user_id, title,
// description, category, source_url, status, match_score, created_at, updated_at.
// We map those to the rich frontend Opportunity type, filling in sane defaults
// for fields that don't exist on the server (e.g. matchReasons, requirements).

function mapBackendOpportunityToFrontend(o: any): Opportunity {
  const matchScore = o.match_score ?? o.matchScore ?? 70;

  // The description field may be a JSON blob with extra fields encoded by
  // the AI seeding service (organisation, type, matchReason).
  let descriptionText = o.description || "";
  let encodedOrg: string | undefined;
  let encodedType: string | undefined;
  let encodedMatchReason: string | undefined;
  try {
    const parsed = JSON.parse(o.description || "{}");
    if (parsed.text) {
      descriptionText   = parsed.text;
      encodedOrg        = parsed.organisation;
      encodedType       = parsed.type;
      encodedMatchReason = parsed.matchReason;
    }
  } catch {
    // plain text description — use as-is
  }

  // Derive type: prefer encoded, then raw field, then infer from category
  const rawType = (encodedType || o.type || o.category || "job").toLowerCase();
  const typeMap: Record<string, string> = {
    career: "job",
    education: "scholarship",
    business: "grant",
    finance: "grant",
    health: "course",
    lifestyle: "event",
    technology: "job",
  };
  const type = (
    ["job","internship","scholarship","course","event","grant","challenge","service"].includes(rawType)
      ? rawType
      : typeMap[rawType] ?? "job"
  ) as Opportunity["type"];

  const category = (o.category || "career").toLowerCase() as Opportunity["category"];

  const matchReason = encodedMatchReason
    ? [encodedMatchReason]
    : (o.match_reasons ?? o.matchReasons ?? ["Matches your active missions"]);

  return {
    id: String(o.opportunity_id || o.id),
    title: o.title || "",
    organisation: encodedOrg || o.organisation || o.provider_name || "Provider",
    type,
    category,
    location: o.location ?? undefined,
    isRemote: o.is_remote ?? o.isRemote ?? false,
    deadline: o.deadline ?? o.application_deadline ?? undefined,
    eligibilitySummary: o.eligibility_summary ?? descriptionText.slice(0, 120) ?? "",
    eligibilityDetails: o.eligibility_details ?? undefined,
    description: descriptionText,
    requirements: o.requirements ?? [],
    requiredDocuments: o.required_documents ?? o.requiredDocuments ?? [],
    applicationUrl: o.source_url ?? o.application_url ?? o.applicationUrl ?? undefined,
    experienceLevel: o.experience_level ?? o.experienceLevel ?? "any",
    matchScore: Number(matchScore),
    relatedMissionId: o.related_mission_id ?? o.relatedMissionId ?? undefined,
    relatedMissionTitle: o.related_mission_title ?? o.relatedMissionTitle ?? undefined,
    matchReasons: Array.isArray(matchReason) ? matchReason : [matchReason],
    isSaved: o.is_saved ?? o.isSaved ?? false,
    isDismissed: o.is_dismissed ?? o.isDismissed ?? false,
    applicationStatus: o.application_status ?? o.applicationStatus ?? "not-applied",
    tags: o.tags ?? [],
    postedAt: o.created_at ?? o.createdAt ?? new Date().toISOString(),
    updatedAt: o.updated_at ?? o.updatedAt ?? new Date().toISOString(),
  };
}

// ─── API functions ────────────────────────────────────────────────────────────

export interface OpportunityFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * GET /api/opportunities
 * Returns the authenticated user's opportunities, sorted by match_score desc.
 */
export async function getOpportunities(
  filters?: OpportunityFilters
): Promise<Opportunity[]> {
  const res = await get<{ data: any[] } | any[]>("/opportunities", {
    params: filters as any,
  });
  // Handle both paginated {data: [...]} and plain array responses
  const list: any[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
  return list.map(mapBackendOpportunityToFrontend);
}

/**
 * GET /api/opportunities/:id
 * Returns a single opportunity.
 */
export async function getOpportunity(id: string | number): Promise<Opportunity> {
  const data = await get<any>(`/opportunities/${id}`);
  return mapBackendOpportunityToFrontend(data);
}

/**
 * POST /api/opportunities
 * Create a new opportunity for the authenticated user.
 */
export async function createOpportunity(payload: {
  title: string;
  description?: string;
  category?: string;
  source_url?: string;
  match_score?: number;
}): Promise<Opportunity> {
  const data = await post<any>("/opportunities", payload);
  return mapBackendOpportunityToFrontend(data);
}

/**
 * PATCH /api/opportunities/:id
 */
export async function updateOpportunity(
  id: string | number,
  patchData: Partial<{ title: string; description: string; status: string; match_score: number }>
): Promise<Opportunity> {
  const data = await patch<any>(`/opportunities/${id}`, patchData);
  return mapBackendOpportunityToFrontend(data);
}

/**
 * DELETE /api/opportunities/:id
 */
export async function deleteOpportunity(id: string | number): Promise<void> {
  await del<void>(`/opportunities/${id}`);
}
