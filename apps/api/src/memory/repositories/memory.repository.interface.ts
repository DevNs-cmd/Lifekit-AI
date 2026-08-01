import { CreateMemoryDto } from "../dto/create-memory.dto";
import { SearchMemoryDto } from "../dto/search-memory.dto";
import { UpdateMemoryDto } from "../dto/update-memory.dto";
import { Memory } from "../entities/memory.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface IMemoryRepository {
  createMemory(userId: string, data: CreateMemoryDto): Promise<Memory>;
  findMemoryById(id: string): Promise<Memory | null>;
  findUserMemories(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>>;
  searchMemoryMetadata(
    userId: string,
    search: SearchMemoryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>>;
  updateMemory(id: string, data: UpdateMemoryDto): Promise<Memory>;
  deleteMemory(id: string): Promise<Memory>;
}
