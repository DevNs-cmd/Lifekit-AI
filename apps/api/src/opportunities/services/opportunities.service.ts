import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { OpportunitiesRepository } from "../repositories/opportunities.repository";
import { AiOpportunitiesService } from "./ai-opportunities.service";
import { CreateOpportunityDto } from "../dto/create-opportunity.dto";
import { UpdateOpportunityDto } from "../dto/update-opportunity.dto";
import { OpportunityQueryDto } from "../dto/opportunity-query.dto";
import { Opportunity } from "../entities/opportunity.entity";
import {
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    private readonly opportunitiesRepository: OpportunitiesRepository,
    private readonly aiOpportunitiesService: AiOpportunitiesService,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: number, dto: CreateOpportunityDto): Promise<Opportunity> {
    return this.opportunitiesRepository.create(userId, dto);
  }

  /**
   * List opportunities for the user.
   *
   * On first visit (count == 0 AND no active filters), we call the AI service
   * to generate a personalised set, save them to the DB, then return them.
   * This runs in the background — if the AI service is unavailable, we return
   * an empty paginated result rather than failing.
   */
  async findAll(
    userId: number,
    query: OpportunityQueryDto,
  ): Promise<PaginatedResult<Opportunity>> {
    const { page, limit, ...filters } = query;

    const pagination = { page, limit };
    const hasFilters =
      !!filters.search || !!filters.category || !!filters.status;

    // Check current count (fast — COUNT query)
    const existing = await this.opportunitiesRepository.findAll(
      userId,
      {} as OpportunityQueryDto,
      { page: 1, limit: 1 },
    );

    if (existing.total === 0 && !hasFilters) {
      // Seed AI-generated opportunities for this user
      await this._seedFromAi(userId);
    }

    return this.opportunitiesRepository.findAll(
      userId,
      filters as OpportunityQueryDto,
      pagination,
    );
  }

  async findOne(id: number, userId: number): Promise<Opportunity> {
    const opp = await this.opportunitiesRepository.findById(id, userId);
    if (!opp) {
      throw new NotFoundException(`Opportunity #${id} not found`);
    }
    return opp;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateOpportunityDto,
  ): Promise<Opportunity> {
    await this.findOne(id, userId);
    return this.opportunitiesRepository.update(id, userId, dto);
  }

  async remove(id: number, userId: number): Promise<Opportunity> {
    await this.findOne(id, userId);
    return this.opportunitiesRepository.delete(id, userId);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Builds user context from DB (profile + missions + goals + skills + interests)
   * then calls the AI service and bulk-inserts the returned opportunities.
   */
  private async _seedFromAi(userId: number): Promise<void> {
    try {
      // Gather context in parallel
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

      const uniqueCategories = [
        ...new Set(missions.map((m) => m.category).filter(Boolean) as string[]),
      ];

      const userContext = {
        user_id:    userId,
        full_name:  user?.full_name  ?? "",
        profession: user?.profession ?? "",
        missions:   missions.map((m) => m.title),
        categories: uniqueCategories,
        goals:      goals.map((g) => g.title),
        skills:     skills.map((s) => s.skill_name).filter(Boolean) as string[],
        interests:  interests.map((i) => i.interest_name).filter(Boolean) as string[],
      };

      const aiOpps = await this.aiOpportunitiesService.generateForUser(
        userContext,
        8,
      );

      if (aiOpps.length === 0) {
        this.logger.warn(
          `AI service returned no opportunities for user_id=${userId}`,
        );
        return;
      }

      // Bulk insert — one at a time to reuse existing create path + error handling
      await Promise.allSettled(
        aiOpps.map((opp) =>
          this.opportunitiesRepository.create(userId, {
            title:       opp.title,
            // Encode organisation + match_reason into description JSON so the
            // frontend mapper can extract them from the stored text
            description: JSON.stringify({
              text:         `${opp.description}\n\n✦ ${opp.match_reason}`,
              organisation: opp.organisation,
              type:         opp.type,
              matchReason:  opp.match_reason,
            }),
            category:    opp.category,
            source_url:  opp.source_url ?? undefined,
            match_score: opp.match_score,
          }),
        ),
      );

      this.logger.log(
        `Seeded ${aiOpps.length} AI opportunities for user_id=${userId}`,
      );
    } catch (err: any) {
      // Non-fatal — user just sees empty list
      this.logger.warn(
        `Failed to seed AI opportunities for user_id=${userId}: ${err?.message ?? err}`,
      );
    }
  }
}
