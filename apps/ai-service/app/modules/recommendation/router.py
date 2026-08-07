"""Recommendations router — AI-powered opportunity generation.

POST /api/v1/recommendations/opportunities
  Accepts a UserContext (missions, goals, skills, interests) from NestJS and
  uses the LLM to generate a personalized list of opportunities that are
  written back to the opportunities table by the NestJS caller.
"""

import json
import logging
from datetime import date
from fastapi import APIRouter, HTTPException
from app.schemas.common import (
    GenerateOpportunitiesRequest,
    GenerateOpportunitiesResponse,
    GeneratedOpportunity,
)
from app.core.llm import get_llm

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])

# Valid categories and types for validation/normalisation
VALID_CATEGORIES = {
    "career", "education", "business", "finance",
    "health", "technology", "lifestyle",
}
VALID_TYPES = {
    "job", "internship", "scholarship", "grant",
    "course", "event", "challenge",
}


def _build_prompt(req: GenerateOpportunitiesRequest) -> str:
    ctx = req.user_context
    count = req.count
    current_year = date.today().year

    missions_str   = ", ".join(ctx.missions[:5])   or "not specified"
    categories_str = ", ".join(ctx.categories[:5]) or "general"
    goals_str      = ", ".join(ctx.goals[:5])      or "not specified"
    skills_str     = ", ".join(ctx.skills[:8])     or "not specified"
    interests_str  = ", ".join(ctx.interests[:8])  or "not specified"

    return f"""You are a personalized opportunity advisor for LifeKit, a life-management platform.
Today's date is {date.today().strftime("%B %d, %Y")}. The current year is {current_year}.

Generate exactly {count} highly relevant, actionable opportunities for this user.

USER PROFILE:
- Name: {ctx.full_name or "User"}
- Profession: {ctx.profession or "not specified"}
- Active Missions: {missions_str}
- Goal Categories: {categories_str}
- Goals: {goals_str}
- Skills: {skills_str}
- Interests: {interests_str}

CRITICAL RULES:
1. ALL dates, deadlines, and years in titles/descriptions MUST be {current_year} or {current_year + 1}. NEVER use past years.
2. Each opportunity must be DIRECTLY relevant to at least one mission, goal, or skill.
3. Vary the types: mix jobs, internships, scholarships, courses, grants, events.
4. Include realistic source URLs (real domains like coursera.org, linkedin.com/jobs, scholarships.gov, etc.).
5. Match scores reflect fit for this specific user (60–99 range).
6. Be specific — "Google SWE Internship {current_year}" not "Software Engineering Internship".
7. Use real, well-known organisations — Google, Microsoft, Coursera, Udemy, Y Combinator, etc.
8. The "organisation" field MUST be the name of the company, university, or platform offering this opportunity.

Respond ONLY with a valid JSON array of exactly {count} objects. No extra text, no markdown.
Each object must have these exact keys:
{{
  "title": "string (include year {current_year} or {current_year + 1} if time-bound)",
  "organisation": "string (real company/university/platform name — NOT 'LifeKit')",
  "description": "2-3 sentence description of the opportunity",
  "category": "one of: career|education|business|finance|health|technology|lifestyle",
  "type": "one of: job|internship|scholarship|grant|course|event|challenge",
  "source_url": "real URL string or null",
  "match_score": number between 60 and 99,
  "match_reason": "one sentence why this matches the user"
}}"""


def _normalise(opp: dict, idx: int) -> dict:
    """Clamp and normalise fields so nothing crashes the NestJS validator."""
    cat = str(opp.get("category", "career")).lower().strip()
    typ = str(opp.get("type", "job")).lower().strip()
    score = opp.get("match_score", 70)

    return {
        "title":        str(opp.get("title", f"Opportunity {idx + 1}"))[:255],
        "organisation": str(opp.get("organisation") or opp.get("organization") or "Provider")[:255],
        "description":  str(opp.get("description", ""))[:2000],
        "category":     cat if cat in VALID_CATEGORIES else "career",
        "type":         typ if typ in VALID_TYPES else "job",
        "source_url":   opp.get("source_url") or None,
        "match_score":  max(0.0, min(100.0, float(score))),
        "match_reason": str(opp.get("match_reason", "Relevant to your goals"))[:500],
    }


@router.post("/opportunities", response_model=GenerateOpportunitiesResponse)
async def generate_opportunities(payload: GenerateOpportunitiesRequest):
    """
    Generate personalised opportunities for a user using the LLM.

    Called by the NestJS OpportunitiesService when a user has no
    existing opportunities (first visit or after clearing).
    """
    logger.info(
        "Generating %d opportunities for user_id=%d",
        payload.count,
        payload.user_context.user_id,
    )

    llm = get_llm(temperature=0.7)
    prompt = _build_prompt(payload)

    try:
        response = await llm.ainvoke(prompt)
        raw = response.content.strip()

        # Strip markdown fences if the model wraps in ```json ... ```
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            raise ValueError("LLM did not return a JSON array")

    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("LLM response parse error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"AI service could not parse LLM response: {exc}",
        ) from exc
    except Exception as exc:
        logger.error("LLM call failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail=f"AI service LLM call failed: {exc}",
        ) from exc

    # Normalise + validate each item
    opportunities: list[GeneratedOpportunity] = []
    for i, raw_opp in enumerate(parsed[: payload.count]):
        try:
            clean = _normalise(raw_opp, i)
            opportunities.append(GeneratedOpportunity(**clean))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Skipping malformed opportunity at index %d: %s", i, exc)

    if not opportunities:
        raise HTTPException(
            status_code=502,
            detail="AI service returned no valid opportunities",
        )

    logger.info(
        "Generated %d valid opportunities for user_id=%d",
        len(opportunities),
        payload.user_context.user_id,
    )

    return GenerateOpportunitiesResponse(
        opportunities=opportunities,
        generated_for_user_id=payload.user_context.user_id,
    )


# ── Marketplace listings generation ───────────────────────────────────────────

from app.schemas.common import (  # noqa: E402 – re-import to pick up new models
    GenerateListingsRequest,
    GenerateListingsResponse,
    GeneratedListing,
)

VALID_LISTING_TYPES = {"course", "service", "expert", "product", "tool", "book"}
VALID_LISTING_CATEGORIES = {
    "Career", "Education", "Business", "Finance",
    "Health", "Technology", "Lifestyle",
}


def _build_listings_prompt(req: GenerateListingsRequest) -> str:
    ctx = req.user_context
    count = req.count
    current_year = date.today().year

    missions_str  = ", ".join(ctx.missions[:5])  or "not specified"
    goals_str     = ", ".join(ctx.goals[:5])     or "not specified"
    skills_str    = ", ".join(ctx.skills[:8])    or "not specified"
    interests_str = ", ".join(ctx.interests[:8]) or "not specified"

    return f"""You are a marketplace curator for LifeKit, a life-management platform.
Today is {date.today().strftime("%B %d, %Y")}. Current year: {current_year}.

Generate exactly {count} relevant marketplace listings (courses, services, tools, books, experts)
that this user should purchase or enrol in to advance their goals.

USER PROFILE:
- Profession: {ctx.profession or "not specified"}
- Active Missions: {missions_str}
- Goals: {goals_str}
- Skills: {skills_str}
- Interests: {interests_str}

CRITICAL RULES:
1. All listings must be DIRECTLY useful for at least one mission or goal.
2. Use REAL platforms and providers: Coursera, Udemy, LinkedIn Learning, Topmate, Fiverr, Amazon, etc.
3. Prices in INR (0 for free content, 499–9999 for paid). Realistic pricing only.
4. Ratings between 4.0 and 5.0.
5. Mix types: courses, tools, books, expert services, products.
6. Category must be Title-Cased (e.g., "Career", "Education").
7. Do NOT generate vague titles — be specific ("Python for Data Science — Hands-On Bootcamp").

Respond ONLY with a valid JSON array of exactly {count} objects. No markdown, no extra text.
Each object must have these exact keys:
{{
  "title": "string",
  "provider_name": "string (real platform or expert name)",
  "category": "one of: Career|Education|Business|Finance|Health|Technology|Lifestyle",
  "description": "2-3 sentence description of what this offers",
  "price": number in INR (0 for free),
  "rating": number between 4.0 and 5.0,
  "type": "one of: course|service|expert|product|tool|book"
}}"""


def _normalise_listing(item: dict, idx: int) -> dict:
    cat = str(item.get("category", "Education")).strip()
    typ = str(item.get("type", "course")).lower().strip()
    # Title-case the category
    cat_tc = cat[0].upper() + cat[1:].lower() if cat else "Education"

    return {
        "title":         str(item.get("title", f"Listing {idx + 1}"))[:255],
        "provider_name": str(item.get("provider_name") or "Provider")[:255],
        "category":      cat_tc if cat_tc in VALID_LISTING_CATEGORIES else "Education",
        "description":   str(item.get("description", ""))[:2000],
        "price":         max(0.0, float(item.get("price", 0) or 0)),
        "rating":        max(4.0, min(5.0, float(item.get("rating", 4.5) or 4.5))),
        "type":          typ if typ in VALID_LISTING_TYPES else "course",
    }


@router.post("/listings", response_model=GenerateListingsResponse)
async def generate_listings(payload: GenerateListingsRequest):
    """
    Generate personalised marketplace listings for a user.
    Called by the NestJS MarketplaceService when the global listing count < 5.
    """
    logger.info(
        "Generating %d marketplace listings for user_id=%d",
        payload.count,
        payload.user_context.user_id,
    )

    llm = get_llm(temperature=0.7)
    prompt = _build_listings_prompt(payload)

    try:
        response = await llm.ainvoke(prompt)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            raise ValueError("LLM did not return a JSON array")
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Listings LLM parse error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Parse error: {exc}") from exc
    except Exception as exc:
        logger.error("Listings LLM call failed: %s", exc)
        raise HTTPException(status_code=503, detail=f"LLM call failed: {exc}") from exc

    listings: list[GeneratedListing] = []
    for i, raw_item in enumerate(parsed[: payload.count]):
        try:
            clean = _normalise_listing(raw_item, i)
            listings.append(GeneratedListing(**clean))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Skipping malformed listing at index %d: %s", i, exc)

    if not listings:
        raise HTTPException(status_code=502, detail="No valid listings generated")

    logger.info("Generated %d listings for user_id=%d", len(listings), payload.user_context.user_id)
    return GenerateListingsResponse(
        listings=listings,
        generated_for_user_id=payload.user_context.user_id,
    )
