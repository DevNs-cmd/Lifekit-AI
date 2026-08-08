"""Shared request/response contracts between NestJS <-> ai-service."""

from pydantic import BaseModel, Field
from typing import Optional, Any


class OrchestrateRequest(BaseModel):
    """What NestJS sends to POST /api/v1/orchestrate."""
    user_id: str
    message: str
    session_id: Optional[str] = None
    context: dict[str, Any] = Field(default_factory=dict)


class OrchestrateResponse(BaseModel):
    """What ai-service returns to NestJS after running the full graph."""
    intent: str
    mission_alignment: dict[str, Any]
    plan: dict[str, Any]
    domain_result: dict[str, Any]
    opportunities: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    execution_guidance: dict[str, Any]
    memory_written: bool


# ── AI-generated Opportunities ────────────────────────────────────────────────

class UserContext(BaseModel):
    """User profile + mission data sent from NestJS to seed opportunities."""
    user_id: int
    full_name: str = ""
    profession: str = ""
    missions: list[str] = Field(default_factory=list)       # mission titles
    categories: list[str] = Field(default_factory=list)     # unique mission categories
    goals: list[str] = Field(default_factory=list)          # goal titles
    skills: list[str] = Field(default_factory=list)         # skill names
    interests: list[str] = Field(default_factory=list)      # interest names


class GeneratedOpportunity(BaseModel):
    """A single AI-generated opportunity to be saved in the DB."""
    title: str
    organisation: str = "Provider"   # real company/university/platform name
    description: str
    category: str           # career | education | business | finance | health | technology | lifestyle
    type: str               # job | internship | scholarship | grant | course | event | challenge
    source_url: Optional[str] = None
    match_score: float      # 0–100, how relevant to this user
    match_reason: str       # one-sentence explanation


class GenerateOpportunitiesRequest(BaseModel):
    """POST /api/v1/recommendations/opportunities request body."""
    user_context: UserContext
    count: int = Field(default=8, ge=3, le=15)


class GenerateOpportunitiesResponse(BaseModel):
    """POST /api/v1/recommendations/opportunities response."""
    opportunities: list[GeneratedOpportunity]
    generated_for_user_id: int


# ── AI-generated Marketplace Listings ─────────────────────────────────────────

class GeneratedListing(BaseModel):
    """A single AI-generated marketplace listing."""
    title: str
    provider_name: str      # real platform, company, or expert name
    category: str           # Career | Education | Business | Finance | Health | Technology | Lifestyle
    description: str        # 2-3 sentence description
    price: float            # in INR, 0 = free
    rating: float           # 4.0–5.0 simulated rating
    type: str               # course | service | expert | product | tool | book


class GenerateListingsRequest(BaseModel):
    """POST /api/v1/recommendations/listings request body."""
    user_context: UserContext
    count: int = Field(default=8, ge=3, le=15)


class GenerateListingsResponse(BaseModel):
    """POST /api/v1/recommendations/listings response."""
    listings: list[GeneratedListing]
    generated_for_user_id: int
