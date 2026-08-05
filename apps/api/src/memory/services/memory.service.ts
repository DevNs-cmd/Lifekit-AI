import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { MemoryRepository } from "../repositories/memory.repository";
import { CreateMemoryDto } from "../dto/create-memory.dto";
import { UpdateMemoryDto } from "../dto/update-memory.dto";
import { SearchMemoryDto } from "../dto/search-memory.dto";
import { Memory } from "../entities/memory.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

@Injectable()
export class MemoryService {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async create(userId: number, dto: CreateMemoryDto): Promise<Memory> {
    return this.memoryRepository.createMemory(userId, dto);
  }

  async findOne(id: number, userId: number): Promise<Memory> {
    const memory = await this.memoryRepository.findMemoryById(id);
    if (!memory) {
      throw new NotFoundException("Memory entry not found");
    }
    if (memory.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this memory entry",
      );
    }
    return memory;
  }

  async findAll(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>> {
    return this.memoryRepository.findUserMemories(userId, pagination);
  }

  async search(
    userId: number,
    searchDto: SearchMemoryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>> {
    return this.memoryRepository.searchMemoryMetadata(
      userId,
      searchDto,
      pagination,
    );
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateMemoryDto,
  ): Promise<Memory> {
    await this.findOne(id, userId); // verify ownership
    return this.memoryRepository.updateMemory(id, dto);
  }

  async remove(id: number, userId: number): Promise<Memory> {
    await this.findOne(id, userId); // verify ownership
    return this.memoryRepository.deleteMemory(id);
  }
}
