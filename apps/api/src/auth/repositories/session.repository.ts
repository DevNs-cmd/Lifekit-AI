import { Injectable, Logger } from "@nestjs/common";
import { ISessionRepository } from "./session.repository.interface";
import { Session } from "../entities/session.entity";
import { CacheService } from "../../common/cache/cache.service";

@Injectable()
export class SessionRepository implements ISessionRepository {
  private readonly logger = new Logger(SessionRepository.name);

  constructor(private readonly cacheService: CacheService) {}

  private getSessionKey(tokenHash: string): string {
    return `lifekit:session:${tokenHash}`;
  }

  private getUserSessionsKey(userId: number): string {
    return `lifekit:user-sessions:${userId}`;
  }

  async createSession(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    const session: Session = {
      id: `sess_${Math.random().toString(36).substring(2, 11)}`,
      userId: data.userId,
      token: data.tokenHash,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const redis = this.cacheService.getClient();
    if (!redis) {
      this.logger.warn(
        "Redis client not available, session created in-memory only (fallback).",
      );
      return session;
    }

    const sessionKey = this.getSessionKey(data.tokenHash);
    const userSessionsKey = this.getUserSessionsKey(data.userId);
    const ttlSeconds = Math.max(
      0,
      Math.ceil((data.expiresAt.getTime() - Date.now()) / 1000),
    );

    try {
      await redis
        .multi()
        .set(sessionKey, JSON.stringify(session), "EX", ttlSeconds)
        .sadd(userSessionsKey, data.tokenHash)
        .expire(userSessionsKey, ttlSeconds)
        .exec();
    } catch (err: any) {
      this.logger.error(
        `Failed to store session in Redis: ${err.message}`,
        err.stack,
      );
    }

    return session;
  }

  async findSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    const redis = this.cacheService.getClient();
    if (!redis) return null;

    try {
      const data = await redis.get(this.getSessionKey(tokenHash));
      if (!data) return null;

      const session = JSON.parse(data) as Session;
      session.expiresAt = new Date(session.expiresAt);
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      return session;
    } catch (err: any) {
      this.logger.error(
        `Failed to retrieve session from Redis: ${err.message}`,
        err.stack,
      );
      return null;
    }
  }

  async findSessionsByUser(userId: number): Promise<Session[]> {
    const redis = this.cacheService.getClient();
    if (!redis) return [];

    try {
      const tokenHashes = await redis.smembers(this.getUserSessionsKey(userId));
      if (!tokenHashes || tokenHashes.length === 0) return [];

      const keys = tokenHashes.map((hash) => this.getSessionKey(hash));
      const results = await redis.mget(...keys);

      const sessions: Session[] = [];
      const expiredHashes: string[] = [];

      for (let i = 0; i < results.length; i++) {
        const data = results[i];
        if (data) {
          const session = JSON.parse(data) as Session;
          session.expiresAt = new Date(session.expiresAt);
          session.createdAt = new Date(session.createdAt);
          session.updatedAt = new Date(session.updatedAt);
          sessions.push(session);
        } else {
          expiredHashes.push(tokenHashes[i]);
        }
      }

      // Cleanup any expired session pointers from the user's set
      if (expiredHashes.length > 0) {
        await redis.srem(this.getUserSessionsKey(userId), ...expiredHashes);
      }

      return sessions;
    } catch (err: any) {
      this.logger.error(
        `Failed to find sessions for user ${userId}: ${err.message}`,
        err.stack,
      );
      return [];
    }
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<Session> {
    const session = await this.findSessionByTokenHash(tokenHash);
    if (!session) {
      throw new Error("Session not found");
    }

    const redis = this.cacheService.getClient();
    if (redis) {
      try {
        await redis
          .multi()
          .del(this.getSessionKey(tokenHash))
          .srem(this.getUserSessionsKey(session.userId), tokenHash)
          .exec();
      } catch (err: any) {
        this.logger.error(
          `Failed to delete session ${tokenHash} from Redis: ${err.message}`,
          err.stack,
        );
      }
    }
    return session;
  }

  async deleteExpiredSessions(): Promise<{ count: number }> {
    // Redis expires sessions automatically using TTL keys.
    return { count: 0 };
  }

  async deleteSessionsByUser(userId: number): Promise<void> {
    const redis = this.cacheService.getClient();
    if (!redis) return;

    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const tokenHashes = await redis.smembers(userSessionsKey);

      if (tokenHashes && tokenHashes.length > 0) {
        const keys = tokenHashes.map((hash) => this.getSessionKey(hash));
        await redis.del(...keys);
      }

      await redis.del(userSessionsKey);
    } catch (err: any) {
      this.logger.error(
        `Failed to delete sessions for user ${userId}: ${err.message}`,
        err.stack,
      );
    }
  }
}
export { ISessionRepository };
