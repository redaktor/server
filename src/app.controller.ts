import { resolve } from 'path';
import {
  Controller, Get, Request, Res, Post, UseGuards, Body, Put, Delete, Param,
  UseInterceptors, OnApplicationBootstrap
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  MinApRO, UserRO, CreateUserDto, UpdateUserDto/*, LoginUserDto*/
} from './API/user/user.entity';
import { ExcludeNullInterceptor } from './API/user/user.decorator';
import { UserService } from './API/user/user.service';
import { AuthService } from './API/auth/auth.service';

// /test :
import { getRepository } from 'typeorm';

@UseInterceptors(ExcludeNullInterceptor)
@Controller()
export class AppController implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user)
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('auth/login')
  getProfile(@Request() req) {
    return req.user
  }
/* TODO admin scope
  @API('Get all users')
  // @Get('users')
  async findAll(@User('mail') mail: string): Promise<any | undefined> {
    return await this.userService.findAll();
  }
*/

  //@API('Get me')
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.userService.findById(req.user.uid);
    console.log('IS LOGGED IN?', user);
    return user
  }

  //@API('Get user by eMail')
  /*
  @Get('user')
  async findUser(@User('mail') mail: string): Promise<UserRO | undefined> {
    return await this.userService.findByEmail(mail);
  }
  */

  //@API('Create user', {201: 'The user has been successfully created.'})
  @Post('users')
  async create(@Body('user') userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  //@API('Update user', {201: 'The user has been successfully updated.'})
  @Put('user')
  async update(@Request() req, @Body('user') userData: UpdateUserDto) {
    return await this.userService.update(req.user.uid, userData);
  }

  //@API('Delete user by eMail', {201: 'The user has been successfully deleted.'})
  @Delete('users/:mail')
  async delete(@Request() req, @Param('mail') mail: any) {
    return await this.userService.delete(req.user.uid, mail);
  }

  @Get()
  root(@Res() res: any) {
    res.sendFile(resolve(__dirname, '../../../src/client/output/dist/index.html'));
  }

  @Get('test')
  async test() {
    const data = await getRepository('permission').find();
    console.log('find',data);
    return data
  }

  onApplicationBootstrap() {
    
  }
}
/*
PERMISSIONS
[TODO, missing: Travel, Arrive]
+ create settings, perissions and plugins

--> Actor Set
:Actor
  :Application
  :Group
  :Organization
  :Person
  :Service

--> Object Set
  :Object
    :Article
    :Audio
    :Event
    :Image
    :Note
    :Page
    :Place
    :Profile
    :Relationship
    :Video

--> CRUD Set
    :theme
    :bookmark
    :mention
    :reply
    [Actor Set]
    [Object Set]



  Accept
  `the actor can accept objects (includes Reject)`

  Add
    `the actor can add objects to targets (e.g. Collections)`

  Announce
    `the actor can call the target's attention (e.g. for "Status Messages")`

  Block
    `the actor can block the object or actor (see also Ignore)`
    :user
    [Actor Set]
    [Object Set]

  Create
    `the actor can create the object`
    [CRUD Set]
  CreateUser
  CreatePermission

  Delete
    `the actor can delete the object`
    [CRUD Set]
  DeleteUser

  Flag
    `the actor can report content as being inappropriate`
    [Actor Set]
    [Object Set]

  Follow
    `the actor can manage relationships (this includes Ignore and Block)`
    [Actor Set]

  Ignore
    `the actor can ignore the object (see also Block)`
    [Actor Set]
    [Object Set]

  Invite
    `the actor can extend an invitation for the object to the target.`
    [Actor Set]
    [Object Set]

  Join
    `the actor can join the object (includes Leave)`
    :Actor
      :Application
      :Group
      :Organization
      :Service
    [Object Set]

  Like
    `the actor can like or endorse the object (includes Dislike)`
    [Object Set]

  Move
    `the actor can move objects from origins to targets (e.g. Collections)`

  Offer
    `the actor can offer objects to targets`

  Question
    `the actor can ask`

  Read
    `the actor can read the object (includes Listen and View)`
    [CRUD Set]
  ReadUser
  ReadPermission
  ReadInstanceSettings

  Remove
    `the actor can remove objects from targets (e.g. Collections)`

  Update
    `the actor can update the object`
    [CRUD Set]
  UpdateUser
  UpdatePermission
  UpdateInstanceSettings


  Push
    `the actor can receive Push Notifications`

*/
