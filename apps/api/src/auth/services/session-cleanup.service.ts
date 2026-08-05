import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SessionRepository } from "../repositories/session.repository";

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private readonly sessionRepository: SessionRepository) {}

  /**
   * Daily cron job scheduled to run at midnight.
   * Purges all expired user sessions from the database.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredSessions() {
    this.logger.log("Starting daily midnight expired session cleanup...");
    try {
      const result = await this.sessionRepository.deleteExpiredSessions();
      this.logger.log(
        `Expired session cleanup completed. Deleted ${result?.count ?? 0} expired sessions.`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to delete expired sessions: ${err.message}`,
        err.stack,
      );
    }
  }
}
