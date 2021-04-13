import { Get, Post, Delete, Param, Controller } from '@nestjs/common';
import {
  ApiBearerAuth, ApiProduces, /*ApiUseTags,*/ ApiResponse, ApiOperation
} from '@nestjs/swagger';
//import API from '../shared/API.decorator';
import ProfileService from './profile.service';
import User from '../user/user.decorator';
export interface ProfileData {
  username: string;
  bio: string;
  image?: string;
  following?: boolean;
}

export interface ProfileRO {
  profile: ProfileData;
}

// TODO
export interface ApRO {

}

@ApiBearerAuth()
//@ApiProduces('application/json')
//@ApiUseTags('profiles')
@Controller('profiles')
export default class ProfileController {

  constructor(private readonly profileService: ProfileService) {}

  //@API(`TODO This is a FAKE route for the demo always returning the AP actor who is currently logged in.`)
  @Get('APusername')
  async getAPProfile(): Promise<ApRO | undefined> {
    return await this.profileService.findAP();
  }

  @Get(':username')
  async getProfile(@User('id') userId: number, @Param('username') username: string): Promise<ProfileRO | undefined> {
    return await this.profileService.findProfile(userId, username);
  }

  //@ApiOperation({ title: 'Follow user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully followed.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':username/follow')
  async follow(@User('mail') mail: string, @Param('username') username: string): Promise<ProfileRO | undefined> {
    return await this.profileService.follow(mail, username);
  }

  @ApiOperation({ title: 'Unfollow user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully unfollowed.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':username/follow')
  async unFollow(@User('mail') mail: string, @Param('username') username: string): Promise<ProfileRO | undefined> {
    return await this.profileService.unFollow(mail, username);
  }

}
