import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("Health & Monitoring")
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("health")
  @ApiOperation({
    summary:
      "Perform comprehensive health checks on the API and its database/caching services",
  })
  @ApiResponse({
    status: 200,
    description: "System is healthy",
  })
  @ApiResponse({
    status: 503,
    description: "One or more database or cache connections are unhealthy",
  })
  async check() {
    return await this.healthService.checkHealth();
  }

  @Get("ready")
  @ApiOperation({
    summary:
      "Readiness probe to confirm if the API is prepared to accept traffic",
  })
  @ApiResponse({
    status: 200,
    description: "API is ready to process requests",
  })
  async ready() {
    return await this.healthService.checkHealth();
  }

  @Get("live")
  @ApiOperation({
    summary: "Fast liveness probe to verify if the node container is running",
  })
  @ApiResponse({
    status: 200,
    description: "API container is active",
  })
  live() {
    return this.healthService.getLiveness();
  }
}
