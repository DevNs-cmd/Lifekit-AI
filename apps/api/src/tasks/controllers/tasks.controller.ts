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
import { TasksService } from "../services/tasks.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskQueryDto } from "../dto/task-query.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { Task } from "../entities/task.entity";

@ApiTags("Tasks")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new task under a mission" })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({
    description: "Task created successfully",
    type: Task,
  })
  @ApiBadRequestResponse({ description: "Invalid task payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() createDto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all tasks for a specific mission" })
  @ApiOkResponse({
    description: "Tasks retrieved successfully",
    type: Task,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  @ApiNotFoundResponse({ description: "Life mission not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access tasks for this mission",
  })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query() query: TaskQueryDto,
  ) {
    const { page, limit, missionId, ...filters } = query;
    if (!missionId) {
      throw new BadRequestException("Mission ID is required");
    }
    const pagination = { page, limit };
    return this.tasksService.findAllByMission(
      userId,
      missionId,
      filters,
      pagination,
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific task" })
  @ApiOkResponse({
    description: "Task retrieved successfully",
    type: Task,
  })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this task",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.tasksService.findOne(id, userId);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a task" })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({
    description: "Task updated successfully",
    type: Task,
  })
  @ApiBadRequestResponse({ description: "Invalid task payload" })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this task",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async update(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() updateDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, updateDto);
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update the status of a specific task" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { status: { type: "string", example: "COMPLETED" } },
    },
  })
  @ApiOkResponse({
    description: "Task status updated successfully",
    type: Task,
  })
  @ApiBadRequestResponse({ description: "Status is required" })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this task",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async updateStatus(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body("status") status: string,
  ) {
    if (!status) {
      throw new BadRequestException("Status is required");
    }
    return this.tasksService.updateStatus(id, userId, status);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a task" })
  @ApiOkResponse({
    description: "Task deleted successfully",
    type: Task,
  })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to access this task",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.tasksService.remove(id, userId);
  }
}
