import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISessionRepository } from './session.repository.interface';
import { Session } from '../entities/session.entity';
import { handlePrismaError } from '../../common/utils/prisma-error.util';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    try {
      return await this.prisma.session.create({
        data: {
          userId: data.userId,
          token: data.token,
          expiresAt: data.expiresAt,
          userAgent: data.userAgent ?? null,
          ipAddress: data.ipAddress ?? null,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { token },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findSessionsByUser(userId: string): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteSession(token: string): Promise<Session> {
    try {
      return await this.prisma.session.delete({
        where: { token },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteExpiredSessions(): Promise<{ count: number }> {
    try {
      return await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
