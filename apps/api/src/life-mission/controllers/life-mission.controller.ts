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
import { LifeMissionService } from "../services/life-mission.service";
import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { UpdateLifeMissionDto } from "../dto/update-life-mission.dto";
import { MissionQueryDto } from "../dto/mission-query.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { LifeMission } from "../entities/life-mission.entity";

@ApiTags("Life Missions")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("life-missions")
export class LifeMissionController {
  constructor(private readonly lifeMissionService: LifeMissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new life mission" })
  @ApiBody({ type: CreateLifeMissionDto })
  @ApiCreatedResponse({
    description: "Life mission created successfully",
    type: LifeMission,
  })
  @ApiBadRequestResponse({ description: "Invalid mission payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() createDto: CreateLifeMissionDto,
  ) {
    return this.lifeMissionService.create(userId, createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all user life missions" })
  @ApiOkResponse({
    description: "Life missions retrieved successfully",
    type: LifeMission,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query() query: MissionQueryDto,
  ) {
    const { page, limit, ...filters } = query;
    const pagination = { page, limit };
    return this.lifeMissionService.findAll(userId, filters, pagination);
  }

  @Get("categories")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all distinct mission categories from the database" })
  @ApiOkResponse({
    description: "Distinct categories retrieved successfully",
    schema: {
      type: "array",
      items: { type: "string" },
      example: ["Business", "Career", "Education", "Finance", "Health"],
    },
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async getCategories(): Promise<string[]> {
    return this.lifeMissionService.getDistinctCategories();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific life mission" })
  @ApiOkResponse({
    description: "Life mission retrieved successfully",
    type: LifeMission,
  })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this mission",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.lifeMissionService.findOne(id, userId);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a life mission" })
  @ApiBody({ type: UpdateLifeMissionDto })
  @ApiOkResponse({
    description: "Life mission updated successfully",
    type: LifeMission,
  })
  @ApiBadRequestResponse({ description: "Invalid mission payload" })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this mission",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async update(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() updateDto: UpdateLifeMissionDto,
  ) {
    return this.lifeMissionService.update(id, userId, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a life mission" })
  @ApiOkResponse({
    description: "Life mission deleted successfully",
    type: LifeMission,
  })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this mission",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.lifeMissionService.remove(id, userId);
  }
}
