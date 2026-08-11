import {
  BadRequestException,
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
import { PlannerService } from "../services/planner.service";
import { CreatePlanDto } from "../dto/create-plan.dto";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { PlannerQueryDto } from "../dto/planner-query.dto";
import { GeneratePlanRequestDto } from "../dto/generate-plan-request.dto";
import { PlannerActionRequestDto } from "../dto/planner-action-request.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { Plan } from "../entities/plan.entity";

@ApiTags("Planner")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller(["plans", "planner"])
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new plan" })
  @ApiBody({ type: CreatePlanDto })
  @ApiCreatedResponse({
    description: "Plan created successfully",
    type: Plan,
  })
  @ApiBadRequestResponse({ description: "Invalid plan payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to attach plans to this mission",
  })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() createDto: CreatePlanDto,
  ) {
    return this.plannerService.create(userId, createDto);
  }

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Generate a plan from user goals and constraints (placeholder)",
    description:
      "Placeholder integration point for the AI planner service. Accepts structured plan generation input and returns an echo of the request without invoking AI logic yet.",
  })
  @ApiBody({ type: GeneratePlanRequestDto })
  @ApiCreatedResponse({
    description: "Plan generation request received",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Plan generation request received",
        },
        received: {
          type: "object",
          properties: {
            goalInput: { type: "string" },
            planningHorizon: { type: "string" },
            priority: { type: "string" },
            userConstraints: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: "Invalid plan generation payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async generate(
    @CurrentUser("user_id") userId: number,
    @Body() generateDto: GeneratePlanRequestDto,
  ) {
    return this.plannerService.generate(userId, generateDto);
  }

  @Post("action")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Run an AI planner action (generate/optimise/reduce/accelerate) against an existing mission",
    description:
      "Calls the AI service to produce a concrete list of plan changes for the given mission. Powers the AI Planner page's action buttons.",
  })
  @ApiBody({ type: PlannerActionRequestDto })
  @ApiOkResponse({ description: "List of proposed plan changes" })
  @ApiBadRequestResponse({ description: "Invalid action payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to plan for this mission",
  })
  async runAction(
    @CurrentUser("user_id") userId: number,
    @Body() actionDto: PlannerActionRequestDto,
  ) {
    return this.plannerService.runAction(userId, actionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all plans associated with a specific life mission",
  })
  @ApiOkResponse({
    description: "Plans retrieved successfully",
    type: Plan,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access plans for this mission",
  })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query() query: PlannerQueryDto,
  ) {
    const { missionId, page, limit } = query;
    const pagination = { page, limit };
    if (!missionId) {
      throw new BadRequestException("Mission ID is required");
    }
    return this.plannerService.findAllByMission(userId, missionId, pagination);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific plan" })
  @ApiOkResponse({
    description: "Plan retrieved successfully",
    type: Plan,
  })
  @ApiNotFoundResponse({ description: "Plan not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this plan",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.plannerService.findOne(id, userId);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update plan details" })
  @ApiBody({ type: UpdatePlanDto })
  @ApiOkResponse({
    description: "Plan updated successfully",
    type: Plan,
  })
  @ApiBadRequestResponse({ description: "Invalid plan payload" })
  @ApiNotFoundResponse({ description: "Plan not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this plan",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async update(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() updateDto: UpdatePlanDto,
  ) {
    return this.plannerService.update(id, userId, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a plan" })
  @ApiOkResponse({
    description: "Plan deleted successfully",
    type: Plan,
  })
  @ApiNotFoundResponse({ description: "Plan not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this plan",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.plannerService.remove(id, userId);
  }
}
