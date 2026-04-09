import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    const profileData = await this.profileService.getProfile(userId);
    if (!profileData) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
    return profileData;
  }
}
