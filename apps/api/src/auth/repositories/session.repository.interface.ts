import { Session } from "../entities/session.entity";

export interface ISessionRepository {
  createSession(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session>;
  findSessionByTokenHash(tokenHash: string): Promise<Session | null>;
  findSessionsByUser(userId: string): Promise<Session[]>;
  deleteSessionByTokenHash(tokenHash: string): Promise<Session>;
  deleteExpiredSessions(): Promise<{ count: number }>;
}
