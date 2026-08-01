import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../../auth/repositories/session.repository";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { UserProfile } from "../interfaces/user-profile.interface";
import { comparePassword, hashPassword } from "../../auth/utils";
import { User } from "../entities/user.entity";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /**
   * Retrieves the profile of the current authenticated user.
   * Throws NotFoundException if the user is not found in the database.
   */
  async getCurrentUser(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException("User not found");
    }
    return this.mapToProfile(user);
  }

  /**
   * Updates the profile of the current authenticated user.
   * Only editable fields are allowed to be updated.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(
        `User with ID ${userId} not found during profile update`,
      );
      throw new NotFoundException("User not found");
    }

    // Call update on the repository
    const updatedUser = await this.userRepository.updateUser(userId, dto);
    return this.mapToProfile(updatedUser);
  }

  /**
   * Updates the preferences object of the current authenticated user.
   * Replaces the existing preferences object in its entirety.
   */
  async updatePreferences(userId: string, data: any): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(
        `User with ID ${userId} not found during preferences update`,
      );
      throw new NotFoundException("User not found");
    }

    const updatedPreference = await this.userRepository.updatePreferences(
      userId,
      data,
    );
    return {
      theme: updatedPreference.theme,
      notificationsEnabled: updatedPreference.notificationsEnabled,
      goals: updatedPreference.goals,
      interests: updatedPreference.interests,
    };
  }

  /**
   * Changes the password of the current authenticated user.
   * Verifies current password, hashes new password, updates repository,
   * and invalidates all refresh token sessions for security.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(
        `User with ID ${userId} not found during password change`,
      );
      throw new NotFoundException("User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid current password provided for user: ${userId}`);
      throw new UnauthorizedException("Invalid current password");
    }

    // Hash the new password and update user
    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepository.updateUser(userId, { passwordHash });

    // Invalidate all active sessions of this user
    try {
      const sessions = await this.sessionRepository.findSessionsByUser(userId);
      for (const session of sessions) {
        await this.sessionRepository.deleteSessionByTokenHash(session.token);
      }
      this.logger.log(
        `Invalidated ${sessions.length} sessions for user: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fully invalidate sessions for user: ${userId}`,
        (error as Error).stack,
      );
    }

    this.logger.log(`Password changed successfully for user: ${userId}`);
    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  /**
   * Helper method to map a User entity to a clean UserProfile response format.
   * Prevents leaking passwordHash or sensitive information.
   */
  private mapToProfile(user: User): UserProfile {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? null,
      profession: user.profession ?? null,
      profilePhoto: user.profilePhoto ?? null,
      preferences: user.preference
        ? {
            theme: user.preference.theme,
            notificationsEnabled: user.preference.notificationsEnabled,
            goals: user.preference.goals,
            interests: user.preference.interests,
          }
        : null,
      createdAt: user.createdAt,
    };
  }
}
