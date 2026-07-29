import { Session } from '../entities/session.entity';

export interface ISessionRepository {
  createSession(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session>;
  findSessionByToken(token: string): Promise<Session | null>;
  findSessionsByUser(userId: string): Promise<Session[]>;
  deleteSession(token: string): Promise<Session>;
  deleteExpiredSessions(): Promise<{ count: number }>;
}
