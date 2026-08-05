import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserNotifications(
    userId: number,
    pagination?: { page?: number; limit?: number },
  ) {
    try {
      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.notifications.findMany({
          where: { user_id: userId },
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.notifications.count({
          where: { user_id: userId },
        }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async markAsRead(id: number) {
    try {
      return await this.prisma.notifications.update({
        where: { notification_id: id },
        data: { is_read: true },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.notifications.delete({
        where: { notification_id: id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.notifications.findUnique({
        where: { notification_id: id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
