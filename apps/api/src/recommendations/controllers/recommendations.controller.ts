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
  BadRequestException,
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
import { RecommendationsService } from "../services/recommendations.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { RecommendationRequestDto } from "../dto/recommendation-request.dto";
import { RecommendationFilterDto } from "../dto/recommendation-filter.dto";
import {
  Recommendation,
  RecommendationStatus,
} from "../entities/recommendation.entity";

@ApiTags("Recommendations")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("recommendations")
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new recommendation suggestion" })
  @ApiBody({ type: RecommendationRequestDto })
  @ApiCreatedResponse({
    description: "Recommendation created successfully",
    type: Recommendation,
  })
  @ApiBadRequestResponse({ description: "Invalid recommendation payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() body: RecommendationRequestDto,
  ) {
    return this.recommendationsService.create(userId, {
      category: body.category,
      title: body.preferences.topics[0] ?? "Recommendation",
      description: body.category,
      relevanceScore: undefined,
      metadata: {
        context: body.context,
        filters: body.filters,
        topics: body.preferences.topics,
        difficultyLevel: body.preferences.difficultyLevel,
        maxDurationMinutes: body.preferences.maxDurationMinutes,
      },
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all user recommendation suggestions" })
  @ApiOkResponse({
    description: "Recommendations retrieved successfully",
    type: Recommendation,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query() filterDto: RecommendationFilterDto,
  ) {
    const { page, limit, ...filters } = filterDto;
    const pagination = { page, limit };
    return this.recommendationsService.findAll(userId, filters, pagination);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific recommendation" })
  @ApiOkResponse({
    description: "Recommendation retrieved successfully",
    type: Recommendation,
  })
  @ApiNotFoundResponse({ description: "Recommendation not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this recommendation",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.recommendationsService.findOne(id, userId);
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update the status of a recommendation" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["ACCEPTED", "DISMISSED"] },
      },
    },
  })
  @ApiOkResponse({
    description: "Recommendation status updated successfully",
    type: Recommendation,
  })
  @ApiBadRequestResponse({ description: "Valid status is required" })
  @ApiNotFoundResponse({ description: "Recommendation not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this recommendation",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async updateStatus(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() body: { status: RecommendationStatus },
  ) {
    if (
      !body.status ||
      !Object.values(RecommendationStatus).includes(body.status)
    ) {
      throw new BadRequestException("Valid status is required");
    }
    return this.recommendationsService.updateStatus(id, userId, body.status);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a recommendation" })
  @ApiOkResponse({
    description: "Recommendation deleted successfully",
    type: Recommendation,
  })
  @ApiNotFoundResponse({ description: "Recommendation not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this recommendation",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.recommendationsService.remove(id, userId);
  }
}
