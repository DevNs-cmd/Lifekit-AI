import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IOpportunitiesRepository } from "./opportunities.repository.interface";
import { Opportunity } from "../entities/opportunity.entity";
import { CreateOpportunityDto } from "../dto/create-opportunity.dto";
import { UpdateOpportunityDto } from "../dto/update-opportunity.dto";
import { OpportunityQueryDto } from "../dto/opportunity-query.dto";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class OpportunitiesRepository implements IOpportunitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: CreateOpportunityDto): Promise<Opportunity> {
    try {
      const record = await this.prisma.opportunities.create({
        data: {
          user_id: userId,
          title: data.title,
          description: data.description ?? null,
          category: data.category ?? null,
          source_url: data.source_url ?? null,
          status: "OPEN",
          match_score: data.match_score != null ? data.match_score : null,
        },
      });
      return mapToEntity(record);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: number, userId: number): Promise<Opportunity | null> {
    try {
      const record = await this.prisma.opportunities.findFirst({
        where: { opportunity_id: id, user_id: userId },
      });
      if (!record) return null;
      return mapToEntity(record);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(
    userId: number,
    filters: OpportunityQueryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Opportunity>> {
    try {
      const where: any = { user_id: userId };

      if (filters.category) {
        where.category = { equals: filters.category, mode: "insensitive" };
      }

      if (filters.status) {
        where.status = { equals: filters.status, mode: "insensitive" };
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      const [records, total] = await this.prisma.$transaction([
        this.prisma.opportunities.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { match_score: "desc" },
            { created_at: "desc" },
          ],
        }),
        this.prisma.opportunities.count({ where }),
      ]);

      return {
        data: records.map(mapToEntity),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(
    id: number,
    _userId: number,
    data: UpdateOpportunityDto,
  ): Promise<Opportunity> {
    try {
      const record = await this.prisma.opportunities.update({
        where: { opportunity_id: id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.source_url !== undefined && { source_url: data.source_url }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.match_score !== undefined && { match_score: data.match_score }),
          updated_at: new Date(),
        },
      });
      return mapToEntity(record);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: number, _userId: number): Promise<Opportunity> {
    try {
      const record = await this.prisma.opportunities.delete({
        where: { opportunity_id: id },
      });
      return mapToEntity(record);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapToEntity(record: any): Opportunity {
  const entity = new Opportunity();
  entity.opportunity_id = record.opportunity_id;
  entity.user_id = record.user_id;
  entity.title = record.title;
  entity.description = record.description ?? null;
  entity.category = record.category ?? null;
  entity.source_url = record.source_url ?? null;
  entity.status = record.status ?? "OPEN";
  entity.match_score = record.match_score != null
    ? parseFloat(record.match_score.toString())
    : null;
  entity.created_at = record.created_at;
  entity.updated_at = record.updated_at;
  return entity;
}
