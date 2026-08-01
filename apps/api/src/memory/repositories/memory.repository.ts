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

  async createMemory(userId: string, data: CreateMemoryDto): Promise<Memory> {
    try {
      const memory = await this.prisma.memory.create({
        data: {
          userId,
          content: data.content,
          type: data.type,
          metadata: data.metadata ?? undefined,
          contextInfo: data.contextInfo ?? null,
        },
      });
      return memory as unknown as Memory;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findMemoryById(id: string): Promise<Memory | null> {
    try {
      const memory = await this.prisma.memory.findUnique({
        where: { id },
      });
      return memory as unknown as Memory | null;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUserMemories(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>> {
    try {
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const where = { userId };

      const [data, total] = await this.prisma.$transaction([
        this.prisma.memory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.memory.count({ where }),
      ]);

      return {
        data: data as unknown as Memory[],
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
    userId: string,
    search: SearchMemoryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>> {
    try {
      const where: any = { userId };

      if (search.type) {
        where.type = search.type;
      }

      if (search.query) {
        where.OR = [
          { content: { contains: search.query, mode: "insensitive" } },
          { contextInfo: { contains: search.query, mode: "insensitive" } },
        ];
      }

      if (search.tags && search.tags.length > 0) {
        // Query tags stored in JSONB column under the 'tags' key
        where.metadata = {
          path: ["tags"],
          array_contains: search.tags,
        };
      }

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.memory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.memory.count({ where }),
      ]);

      return {
        data: data as unknown as Memory[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateMemory(id: string, data: UpdateMemoryDto): Promise<Memory> {
    try {
      const updateData: any = {};
      if (data.content !== undefined) updateData.content = data.content;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.contextInfo !== undefined)
        updateData.contextInfo = data.contextInfo;

      const memory = await this.prisma.memory.update({
        where: { id },
        data: updateData,
      });
      return memory as unknown as Memory;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteMemory(id: string): Promise<Memory> {
    try {
      const memory = await this.prisma.memory.delete({
        where: { id },
      });
      return memory as unknown as Memory;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
