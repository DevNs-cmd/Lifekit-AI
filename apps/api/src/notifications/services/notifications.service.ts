import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { NotificationsRepository } from "../repositories/notifications.repository";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async findAll(
    userId: number,
    pagination?: { page?: number; limit?: number },
  ) {
    return this.notificationsRepository.findUserNotifications(
      userId,
      pagination,
    );
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this notification",
      );
    }
    return this.notificationsRepository.markAsRead(id);
  }

  async remove(id: number, userId: number) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to delete this notification",
      );
    }
    return this.notificationsRepository.delete(id);
  }

  async getUnreadCount(userId: number) {
    return this.notificationsRepository.getUnreadCount(userId);
  }
}
