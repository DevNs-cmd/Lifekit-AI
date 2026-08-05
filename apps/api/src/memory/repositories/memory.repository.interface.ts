import { CreateMemoryDto } from "../dto/create-memory.dto";
import { SearchMemoryDto } from "../dto/search-memory.dto";
import { UpdateMemoryDto } from "../dto/update-memory.dto";
import { Memory } from "../entities/memory.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface IMemoryRepository {
  createMemory(userId: number, data: CreateMemoryDto): Promise<Memory>;
  findMemoryById(id: number): Promise<Memory | null>;
  findUserMemories(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>>;
  searchMemoryMetadata(
    userId: number,
    search: SearchMemoryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Memory>>;
  updateMemory(id: number, data: UpdateMemoryDto): Promise<Memory>;
  deleteMemory(id: number): Promise<Memory>;
}
