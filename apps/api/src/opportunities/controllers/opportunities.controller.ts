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
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { OpportunitiesService } from "../services/opportunities.service";
import { CreateOpportunityDto } from "../dto/create-opportunity.dto";
import { UpdateOpportunityDto } from "../dto/update-opportunity.dto";
import { OpportunityQueryDto } from "../dto/opportunity-query.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { Opportunity } from "../entities/opportunity.entity";

@ApiTags("Opportunities")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  /**
   * GET /api/opportunities
   * List all opportunities for the authenticated user with optional filters.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List opportunities for the authenticated user" })
  @ApiOkResponse({
    description: "Opportunities retrieved successfully",
    type: Opportunity,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query() query: OpportunityQueryDto,
  ) {
    return this.opportunitiesService.findAll(userId, query);
  }

  /**
   * GET /api/opportunities/:id
   * Get a single opportunity by ID (must belong to the authenticated user).
   */
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a single opportunity by ID" })
  @ApiOkResponse({
    description: "Opportunity retrieved successfully",
    type: Opportunity,
  })
  @ApiNotFoundResponse({ description: "Opportunity not found" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.opportunitiesService.findOne(id, userId);
  }

  /**
   * POST /api/opportunities
   * Create a new opportunity for the authenticated user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new opportunity" })
  @ApiBody({ type: CreateOpportunityDto })
  @ApiCreatedResponse({
    description: "Opportunity created successfully",
    type: Opportunity,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(userId, dto);
  }

  /**
   * PATCH /api/opportunities/:id
   * Update an opportunity (must belong to the authenticated user).
   */
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an opportunity" })
  @ApiBody({ type: UpdateOpportunityDto })
  @ApiOkResponse({
    description: "Opportunity updated successfully",
    type: Opportunity,
  })
  @ApiNotFoundResponse({ description: "Opportunity not found" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async update(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(id, userId, dto);
  }

  /**
   * DELETE /api/opportunities/:id
   * Delete an opportunity (must belong to the authenticated user).
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete an opportunity" })
  @ApiOkResponse({
    description: "Opportunity deleted successfully",
    type: Opportunity,
  })
  @ApiNotFoundResponse({ description: "Opportunity not found" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.opportunitiesService.remove(id, userId);
  }
}
