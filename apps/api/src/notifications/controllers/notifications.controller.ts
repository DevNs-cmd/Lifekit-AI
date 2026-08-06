import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { NotificationsService } from "../services/notifications.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";

@ApiTags("Notifications")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all notifications for the current user" })
  @ApiOkResponse({
    description: "Notifications list retrieved successfully",
  })
  async findAll(
    @CurrentUser("user_id") userId: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const pagination = {
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 10,
    };
    return this.notificationsService.findAll(userId, pagination);
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiOkResponse({
    description: "Notification marked as read successfully",
  })
  async markAsRead(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a specific notification" })
  @ApiOkResponse({
    description: "Notification deleted successfully",
  })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.notificationsService.remove(id, userId);
  }
}
