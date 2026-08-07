import { Injectable, Logger } from "@nestjs/common";
import { AppConfigService } from "../../config/app-config.service";

// ── Shapes that mirror the ai-service Pydantic models ────────────────────────

export interface UserContext {
  user_id: number;
  full_name?: string;
  profession?: string;
  missions?: string[];
  categories?: string[];
  goals?: string[];
  skills?: string[];
  interests?: string[];
}

export interface AiGeneratedOpportunity {
  title: string;
  organisation: string;
  description: string;
  category: string;
  type: string;
  source_url: string | null;
  match_score: number;
  match_reason: string;
}

interface AiResponse {
  opportunities: AiGeneratedOpportunity[];
  generated_for_user_id: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class AiOpportunitiesService {
  private readonly logger = new Logger(AiOpportunitiesService.name);

  constructor(private readonly config: AppConfigService) {}

  /**
   * Calls POST /api/v1/recommendations/opportunities on the AI service.
   * Returns an empty array on any failure so the caller degrades gracefully.
   */
  async generateForUser(
    userContext: UserContext,
    count = 8,
  ): Promise<AiGeneratedOpportunity[]> {
    const url = `${this.config.aiServiceUrl}/api/v1/recommendations/opportunities`;

    const body = {
      user_context: {
        user_id:    userContext.user_id,
        full_name:  userContext.full_name  ?? "",
        profession: userContext.profession ?? "",
        missions:   userContext.missions   ?? [],
        categories: userContext.categories ?? [],
        goals:      userContext.goals      ?? [],
        skills:     userContext.skills     ?? [],
        interests:  userContext.interests  ?? [],
      },
      count,
    };

    try {
      this.logger.log(
        `Requesting ${count} AI opportunities for user_id=${userContext.user_id}`,
      );

      const res = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
        // 30-second timeout — LLM calls can be slow
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "(no body)");
        this.logger.warn(
          `AI service returned HTTP ${res.status} for user_id=${userContext.user_id}: ${text}`,
        );
        return [];
      }

      const data = (await res.json()) as AiResponse;
      this.logger.log(
        `AI service returned ${data.opportunities?.length ?? 0} opportunities for user_id=${userContext.user_id}`,
      );
      return data.opportunities ?? [];
    } catch (err: any) {
      // Network error, timeout, or AI service is down — fail silently
      this.logger.warn(
        `AI opportunities generation failed for user_id=${userContext.user_id}: ${err?.message ?? err}`,
      );
      return [];
    }
  }
}

// ── Marketplace listings generation ──────────────────────────────────────────

export interface AiGeneratedListing {
  title: string;
  provider_name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  type: string;
}

interface AiListingsResponse {
  listings: AiGeneratedListing[];
  generated_for_user_id: number;
}

  /* NOTE: This method is defined outside the class intentionally — it will be
   * used by MarketplaceService via a separate AiMarketplaceService that
   * extends / re-uses AiOpportunitiesService. For simplicity we export a
   * standalone function that any service can call. */

/**
 * Calls POST /api/v1/recommendations/listings on the AI service.
 * Returns an empty array on any failure.
 */
export async function generateMarketplaceListings(
  aiServiceUrl: string,
  userContext: UserContext,
  count = 8,
): Promise<AiGeneratedListing[]> {
  const url = `${aiServiceUrl}/api/v1/recommendations/listings`;
  const body = { user_context: userContext, count };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as AiListingsResponse;
    return data.listings ?? [];
  } catch {
    return [];
  }
}
