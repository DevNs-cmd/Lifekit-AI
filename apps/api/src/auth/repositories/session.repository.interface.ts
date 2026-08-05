import { Session } from "../entities/session.entity";

export interface ISessionRepository {
  createSession(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session>;
  findSessionByTokenHash(tokenHash: string): Promise<Session | null>;
  findSessionsByUser(userId: number): Promise<Session[]>;
  deleteSessionByTokenHash(tokenHash: string): Promise<Session>;
  deleteExpiredSessions(): Promise<{ count: number }>;
  deleteSessionsByUser(userId: number): Promise<void>;
}
