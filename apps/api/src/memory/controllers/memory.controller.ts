import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { MemoryService } from "../services/memory.service";
import { CreateMemoryDto } from "../dto/create-memory.dto";
import { UpdateMemoryDto } from "../dto/update-memory.dto";
import { MemoryQueryDto } from "../dto/memory-query.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { Memory } from "../entities/memory.entity";

@ApiTags("Memories")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller(["memories", "user/memories"])
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new memory entry" })
  @ApiBody({ type: CreateMemoryDto })
  @ApiCreatedResponse({
    description: "Memory entry created successfully",
    type: Memory,
  })
  @ApiBadRequestResponse({ description: "Invalid memory payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() createDto: CreateMemoryDto,
  ) {
    return this.memoryService.create(userId, createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all user memory entries or search them" })
  @ApiOkResponse({
    description: "Memory entries retrieved successfully",
    type: Memory,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query() query: MemoryQueryDto,
  ) {
    const { page, limit, ...search } = query;
    const pagination = { page, limit };

    if (
      search.query ||
      search.type ||
      (search.tags && search.tags.length > 0)
    ) {
      return this.memoryService.search(userId, search, pagination);
    }

    return this.memoryService.findAll(userId, pagination);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific memory entry" })
  @ApiOkResponse({
    description: "Memory entry retrieved successfully",
    type: Memory,
  })
  @ApiNotFoundResponse({ description: "Memory entry not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this memory entry",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.memoryService.findOne(id, userId);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a memory entry" })
  @ApiBody({ type: UpdateMemoryDto })
  @ApiOkResponse({
    description: "Memory entry updated successfully",
    type: Memory,
  })
  @ApiBadRequestResponse({ description: "Invalid memory payload" })
  @ApiNotFoundResponse({ description: "Memory entry not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this memory entry",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async update(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() updateDto: UpdateMemoryDto,
  ) {
    return this.memoryService.update(id, userId, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a memory entry" })
  @ApiOkResponse({
    description: "Memory entry deleted successfully",
    type: Memory,
  })
  @ApiNotFoundResponse({ description: "Memory entry not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this memory entry",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.memoryService.remove(id, userId);
  }
}
