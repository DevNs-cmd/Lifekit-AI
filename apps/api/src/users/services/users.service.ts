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
   */
  async getCurrentUser(userId: number): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException("User not found");
    }
    return this.mapToProfile(user);
  }

  /**
   * Updates the profile of the current authenticated user.
   */
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(
        `User with ID ${userId} not found during profile update`,
      );
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.userRepository.updateUser(userId, dto);
    return this.mapToProfile(updatedUser);
  }

  /**
   * Updates the preferences object of the current authenticated user.
   */
  async updatePreferences(userId: number, data: any): Promise<any> {
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
      notificationsEnabled: updatedPreference.notification_enabled ?? true,
      goals: updatedPreference.goals ?? [],
      interests: updatedPreference.interests ?? [],
    };
  }

  /**
   * Changes the password of the current authenticated user.
   */
  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(
        `User with ID ${userId} not found during password change`,
      );
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await comparePassword(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid current password provided for user: ${userId}`);
      throw new UnauthorizedException("Invalid current password");
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepository.updateUser(userId, { passwordHash });

    try {
      await this.sessionRepository.deleteSessionsByUser(userId);
      this.logger.log(`Invalidated all active sessions for user: ${userId}`);
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

  private mapToProfile(user: User): UserProfile {
    return {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone ?? null,
      profession: user.profession ?? null,
      profilePhoto: user.profile_photo ?? null,
      preferences: user.preference
        ? {
            theme: user.preference.theme,
            notificationsEnabled: user.preference.notification_enabled ?? true,
            goals: user.preference.goals ?? [],
            interests: user.preference.interests ?? [],
          }
        : null,
      createdAt: user.created_at,
      subscriptionPlan: user.subscriptionPlan ?? "free",
    };
  }
}
