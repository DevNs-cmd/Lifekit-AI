import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IMemoryRepository } from "./memory.repository.interface";
import { CreateMemoryDto } from "../dto/create-memory.dto";
import { SearchMemoryDto } from "../dto/search-memory.dto";
import { UpdateMemoryDto } from "../dto/update-memory.dto";
import { Memory } from "../entities/memory.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class MemoryRepository implements IMemoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMemory(userId: number, data: CreateMemoryDto): Promise<Memory> {
    try {
      const memoryType = data.type || data.memoryType || "CONTEXT";
      const serializedContent = JSON.stringify({
        text: data.content,
        metadata: data.metadata ?? {},
        contextInfo: data.contextInfo ?? null,
        relatedMissionId: data.relatedMissionId ?? null,
      });

      const memory = await this.prisma.ai_memory.create({
        data: {
          user_id: userId,
          content: serializedContent,
          memory_type: memoryType,
          title: data.contextInfo ? data.contextInfo.substring(0, 255) : null,
          importance_score: data.importanceScore ?? null,
          embedding_id: null,
        },
      });
      return mapPrismaMemoryToEntity(memory);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findMemoryById(id: number): Promise<Memory | null> {
    try {
      const memory = await this.prisma.ai_memory.findUnique({
        where: { memory_id: id },
      });
      if (!memory) return null;
      return mapPrismaMemoryToEntity(memory);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUserMemories(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>> {
    try {
      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const where = { user_id: userId };

      const [data, total] = await this.prisma.$transaction([
        this.prisma.ai_memory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.ai_memory.count({ where }),
      ]);

      return {
        data: data.map((m) => mapPrismaMemoryToEntity(m)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async searchMemoryMetadata(
    userId: number,
    search: SearchMemoryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>> {
    try {
      const where: any = { user_id: userId };

      if (search.type) {
        where.memory_type = search.type;
      }

      if (search.query) {
        where.content = { contains: search.query, mode: "insensitive" };
      }

      if (search.tags && search.tags.length > 0) {
        // Query tags which are serialized in content JSON
        where.AND = search.tags.map((tag) => ({
          content: { contains: tag, mode: "insensitive" },
        }));
      }

      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.ai_memory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.ai_memory.count({ where }),
      ]);

      return {
        data: data.map((m) => mapPrismaMemoryToEntity(m)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateMemory(id: number, data: UpdateMemoryDto): Promise<Memory> {
    try {
      const existing = await this.prisma.ai_memory.findUnique({
        where: { memory_id: id },
      });

      if (!existing) {
        throw new Error("Memory not found");
      }

      let text = data.content;
      let metadata = data.metadata;
      let contextInfo = data.contextInfo;
      let relatedMissionId = data.relatedMissionId;

      try {
        const parsed = JSON.parse(existing.content || "{}");
        if (text === undefined) text = parsed.text;
        if (metadata === undefined) metadata = parsed.metadata;
        if (contextInfo === undefined) contextInfo = parsed.contextInfo;
        if (relatedMissionId === undefined)
          relatedMissionId = parsed.relatedMissionId;
      } catch {
        // legacy
      }

      const serializedContent = JSON.stringify({
        text: text ?? existing.content,
        metadata: metadata ?? {},
        contextInfo: contextInfo ?? null,
        relatedMissionId: relatedMissionId ?? null,
      });

      const updatePayload: any = {
        content: serializedContent,
      };

      const memoryType = data.type || data.memoryType;
      if (memoryType !== undefined) updatePayload.memory_type = memoryType;
      if (data.importanceScore !== undefined)
        updatePayload.importance_score = data.importanceScore;
      if (contextInfo !== undefined)
        updatePayload.title = contextInfo
          ? contextInfo.substring(0, 255)
          : null;

      const memory = await this.prisma.ai_memory.update({
        where: { memory_id: id },
        data: updatePayload,
      });
      return mapPrismaMemoryToEntity(memory);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteMemory(id: number): Promise<Memory> {
    try {
      const memory = await this.prisma.ai_memory.findUnique({
        where: { memory_id: id },
      });
      if (memory) {
        await this.prisma.ai_memory.delete({
          where: { memory_id: id },
        });
      }
      return mapPrismaMemoryToEntity(memory!)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaMemoryToEntity(m: any): Memory {
  if (!m) return null as any;

  let text = m.content;
  let metadata = {};
  let contextInfo = null;
  let relatedMissionId = null;

  try {
    const parsed = JSON.parse(m.content || "{}");
    text = parsed.text ?? m.content;
    metadata = parsed.metadata ?? {};
    contextInfo = parsed.contextInfo ?? null;
    relatedMissionId = parsed.relatedMissionId ?? null;
  } catch {
    // raw string
  }

  return {
    memory_id: m.memory_id,
    user_id: m.user_id,
    content: text,
    memory_type: m.memory_type,
    title: m.title,
    importance_score: m.importance_score
      ? parseFloat(m.importance_score.toString())
      : null,
    embedding_id: m.embedding_id,
    created_at: m.created_at,
    updated_at: m.updated_at,
    metadata,
    contextInfo,
    relatedMissionId,
    id: m.memory_id,
    userId: m.user_id,
    type: m.memory_type,
  } as unknown as Memory;
}
