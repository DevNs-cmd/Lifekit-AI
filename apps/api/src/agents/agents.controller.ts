import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AgentsService, DomainAgent } from "./agents.service";
import { AgentRequestDto } from "./dto/agent-request.dto";
import { AgentResponseDto } from "./dto/agent-response.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { SetTimeout } from "../common/interceptors/timeout.interceptor";

@ApiTags("Agents")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("agents")
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all available domain agents" })
  @ApiOkResponse({
    description: "Domain agents list retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          domain: { type: "string" },
          description: { type: "string" },
          capabilities: { type: "array", items: { type: "string" } },
          isAvailable: { type: "boolean" },
          relatedCategories: { type: "array", items: { type: "string" } },
        },
      },
    },
  })
  async findAll(): Promise<DomainAgent[]> {
    return this.agentsService.getAgents();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific domain agent" })
  @ApiOkResponse({
    description: "Agent details retrieved successfully",
  })
  async findOne(@Param("id") id: string): Promise<DomainAgent> {
    return this.agentsService.getAgent(id);
  }

  @Post("run")
  @HttpCode(HttpStatus.CREATED)
  // Orchestrator makes 6+ sequential LLM calls and is allowed up to 90s
  // internally (see agents.service.ts) - override the global 60s
  // TimeoutInterceptor default so Nest doesn't kill the request early.
  @SetTimeout(95_000)
  @ApiOperation({ summary: "Run an AI agent task execution" })
  @ApiBody({ type: AgentRequestDto })
  @ApiCreatedResponse({
    description: "AI agent task completed successfully",
    type: AgentResponseDto,
  })
  async runAgent(
    @CurrentUser("user_id") userId: number,
    @Body() dto: AgentRequestDto,
  ): Promise<AgentResponseDto> {
    return this.agentsService.run(userId, dto);
  }
}
