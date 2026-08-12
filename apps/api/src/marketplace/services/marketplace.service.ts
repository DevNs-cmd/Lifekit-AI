import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MarketplaceRepository } from "../repositories/marketplace.repository";
import { CreateListingDto } from "../dto/create-listing.dto";
import { SearchListingDto } from "../dto/search-listing.dto";
import { UpdateListingDto } from "../dto/update-listing.dto";
import { MarketplaceListing } from "../entities/marketplace-listing.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { AppConfigService } from "../../config/app-config.service";
import { PrismaService } from "../../prisma/prisma.service";
import {
  MISSION_EVENTS,
  MissionCreatedEvent,
  MissionUpdatedEvent,
} from "../../common/events/mission-events";

// Minimum listings before we consider the catalogue seeded for a given user
const MIN_LISTING_COUNT = 5;

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: number,
    dto: CreateListingDto,
  ): Promise<MarketplaceListing> {
    return this.marketplaceRepository.createListing(userId, dto);
  }

  /**
   * List marketplace listings.
   * When the catalogue is empty (< MIN_LISTING_COUNT) and no filters are
   * applied, call the AI service to generate a personalised batch, persist
   * them, then return the result. Subsequent calls hit the DB directly.
   */
  async findAll(
    userId: number,
    filters: SearchListingDto & { isAvailable?: boolean },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplaceListing>> {
    const hasFilters = !!(
      filters.query ||
      filters.category ||
      (filters.tags && filters.tags.length > 0) ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
    );

    if (!hasFilters) {
      // Count only listings that belong to this user (stored in description JSON)
      const userListings = await this._countUserListings(userId);
      this.logger.log(`Marketplace count for user_id=${userId}: ${userListings}`);
      if (userListings < MIN_LISTING_COUNT) {
        this.logger.log(`Seeding marketplace for user_id=${userId}...`);
        await this._seedFromAi(userId);
      }
    }

    return this.marketplaceRepository.searchListings(filters, pagination);
  }

  async findOne(id: number): Promise<MarketplaceListing> {
    const listing = await this.marketplaceRepository.findListingById(id);
    if (!listing) {
      throw new NotFoundException("Marketplace listing not found");
    }
    return listing;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateListingDto,
  ): Promise<MarketplaceListing> {
    const listing = await this.findOne(id);
    if (listing.userId && Number(listing.userId) !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this listing",
      );
    }
    return this.marketplaceRepository.updateListing(id, dto);
  }

  async remove(id: number, userId: number): Promise<MarketplaceListing> {
    const listing = await this.findOne(id);
    if (listing.userId && Number(listing.userId) !== userId) {
      throw new ForbiddenException(
        "You do not have permission to delete this listing",
      );
    }
    return this.marketplaceRepository.deleteListing(id);
  }

  // ── Event listeners ─────────────────────────────────────────────────────────

  /**
   * Fires when a user creates a new mission.
   * Clears that user's AI-seeded marketplace listings and regenerates them
   * with the updated mission context. Other users' listings are untouched.
   */
  @OnEvent(MISSION_EVENTS.CREATED, { async: true })
  async handleMissionCreated(event: MissionCreatedEvent): Promise<void> {
    this.logger.log(
      `mission.created for user_id=${event.userId} — refreshing marketplace`,
    );
    await this._refreshForUser(event.userId);
  }

  /**
   * Fires when a user updates an existing mission.
   * Re-seeds marketplace listings so they reflect the changed mission details.
   */
  @OnEvent(MISSION_EVENTS.UPDATED, { async: true })
  async handleMissionUpdated(event: MissionUpdatedEvent): Promise<void> {
    this.logger.log(
      `mission.updated for user_id=${event.userId} — refreshing marketplace`,
    );
    await this._refreshForUser(event.userId);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /** Delete and reseed listings for a single user. Catches all errors. */
  private async _refreshForUser(userId: number): Promise<void> {
    try {
      await this._deleteUserListings(userId);
      this.logger.log(`Cleared marketplace listings for user_id=${userId}`);
      await this._seedFromAi(userId);
    } catch (err: any) {
      this.logger.warn(
        `_refreshForUser (marketplace) failed for user_id=${userId}: ${err?.message ?? err}`,
      );
    }
  }

  /**
   * Count how many marketplace listings belong to this user.
   * The marketplace table has no user_id column, so ownership is stored
   * inside the description JSON field (key: "userId") — the same convention
   * used by createListing() and the repository mapper.
   */
  private async _countUserListings(userId: number): Promise<number> {
    return this.prisma.marketplace.count({
      where: {
        description: { contains: `"userId":${userId}` },
      },
    });
  }

  /**
   * Delete all marketplace listings that belong to this user.
   * Fetches matching rows first, then deletes by primary key to avoid a
   * full-table scan on the JSON field in a single DELETE statement.
   */
  private async _deleteUserListings(userId: number): Promise<void> {
    const rows = await this.prisma.marketplace.findMany({
      where: { description: { contains: `"userId":${userId}` } },
      select: { service_id: true },
    });
    if (rows.length === 0) return;
    await this.prisma.marketplace.deleteMany({
      where: { service_id: { in: rows.map((r) => r.service_id) } },
    });
  }

  private async _callAiService(userContext: object, count: number): Promise<any[]> {
    const url = `${this.config.aiServiceUrl}/api/v1/recommendations/listings`;
    this.logger.log(`Calling AI service at ${url}`);

    try {
      // Use a promise-race timeout instead of AbortSignal.timeout for Node 18 compat
      const fetchPromise = fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_context: userContext, count }),
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI service timeout (30s)")), 30_000),
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!res.ok) {
        const text = await res.text().catch(() => "(no body)");
        this.logger.warn(`AI service HTTP ${res.status}: ${text}`);
        return [];
      }

      const data = await res.json() as { listings?: any[] };
      this.logger.log(`AI service returned ${data.listings?.length ?? 0} listings`);
      return data.listings ?? [];
    } catch (err: any) {
      this.logger.warn(`AI service call failed: ${err?.message ?? err}`);
      return [];
    }
  }

  private async _seedFromAi(userId: number): Promise<void> {
    try {
      // Gather user context for personalisation
      const [user, missions, goals, skills, interests] = await Promise.all([
        this.prisma.users.findUnique({ where: { user_id: userId } }),
        this.prisma.missions.findMany({
          where: { user_id: userId },
          select: { title: true, category: true },
          take: 10,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.goals.findMany({
          where: { user_id: userId },
          select: { title: true },
          take: 10,
        }),
        this.prisma.skills.findMany({
          where: { user_id: userId },
          select: { skill_name: true },
          take: 15,
        }),
        this.prisma.interests.findMany({
          where: { user_id: userId },
          select: { interest_name: true },
          take: 15,
        }),
      ]);

      const userContext = {
        user_id:    userId,
        full_name:  user?.full_name  ?? "",
        profession: user?.profession ?? "",
        missions:   missions.map((m) => m.title),
        categories: [...new Set(missions.map((m) => m.category).filter(Boolean) as string[])],
        goals:      goals.map((g) => g.title),
        skills:     skills.map((s) => s.skill_name).filter(Boolean) as string[],
        interests:  interests.map((i) => i.interest_name).filter(Boolean) as string[],
      };

      const aiListings = await this._callAiService(userContext, 10);

      if (aiListings.length === 0) {
        this.logger.warn("AI service returned no marketplace listings");
        return;
      }

      // Bulk insert via prisma directly (bypasses the complex CreateListingDto)
      const results = await Promise.allSettled(
        aiListings.map((l: any) =>
          this.prisma.marketplace.create({
            data: {
              service_name:  String(l.title ?? "Service").slice(0, 255),
              provider_name: String(l.provider_name ?? "Provider").slice(0, 255),
              category:      String(l.category ?? "Education").slice(0, 100),
              // Store userId + extra fields in the description JSON so the
              // repository mapper and per-user queries can use it.
              description: JSON.stringify({
                text:      String(l.description ?? "").slice(0, 2000),
                userId,
                tags:      [],
                isFree:    Number(l.price ?? 0) === 0,
                isAvailable: true,
                stock:     null,
              }),
              price:         Math.max(0, Number(l.price ?? 0)),
              rating:        Math.min(5.0, Math.max(4.0, Number(l.rating ?? 4.5))),
              image_url:     null,
            },
          }),
        ),
      );

      const saved = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      this.logger.log(
        `Seeded ${saved} marketplace listings (${failed} failed) for user_id=${userId}`,
      );
    } catch (err: any) {
      this.logger.warn(`_seedFromAi failed: ${err?.message ?? err}`);
    }
  }
}
