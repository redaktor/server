import { Get,Post,Body,Put,Delete,Query,Param,Controller } from '@nestjs/common';
//import API from '../shared/API.decorator';
import { CreateObjectDto, ObjectRO, ObjectsRO } from './object.entity';
import User from '../user/user.decorator';
import ObjectService from './object.service';

//@API({produces: 'application/json', tags: 'objects'})
@Controller('objects')
export default class ObjectController {

  constructor(private readonly objectService: ObjectService) {}

  //@API('Get all objects')
  @Get()
  async findAll(@Query() query: any): Promise<ObjectsRO> {
    return await this.objectService.findAll(query);
  }

  //@API('Get object feed')
  @Get('feed')
  async getFeed(@User('id') userId: number, @Query() query: any) {
    return await this.objectService.findFeed(userId, query);
  }

  //@API('Find one object')
  @Get(':slug')
  async findOne(@Param('slug') slug: any): Promise<ObjectRO | undefined> {
    return await this.objectService.findOne({slug});
  }

/*
  @API('Find comments for an object')
  @Get(':slug/comments')
  async findComments(@Param('slug') slug: any): Promise<CommentsRO | undefined> {
    return await this.objectService.findComments(slug);
  }
*/

  //@API('Create object', {201: 'The object has been successfully created.'})
  @Post()
  async create(@User('id') userId: number, @Body('object') objectData: CreateObjectDto) {
    return this.objectService.create(userId, objectData);
  }

  //@API('Update object', {201: 'The object has been successfully updated.'})
  @Put(':slug')
  async update(
    @User('id') userId: number, @Param() params: any,
    @Body('object') objectData: CreateObjectDto
  ) {
    // Todo: update slug also when title gets changed
    return this.objectService.update(params.slug, objectData);
  }

  //@API('Delete object', {201: 'The object has been successfully deleted.'})
  @Delete(':slug')
  async delete(@User('id') userId: number, @Param() params: any) {
    return this.objectService.delete(params.slug);
  }
/*
  @API('Create comment', {201: 'The comment has been successfully created.'})
  @Post(':slug/comments')
  async createComment(
    @User('id') userId: number, @Param('slug') slug: any,
    @Body('comment') commentData: CreateCommentDto
  ) {
    return await this.objectService.addComment(userId, slug, commentData);
  }

  @API('Delete comment', {201: 'The comment has been successfully deleted.'})
  @Delete(':slug/comments/:id')
  async deleteComment(@User('id') userId: number, @Param() params: any) {
    const {slug, id} = params;
    return await this.objectService.deleteComment(slug, id);
  }
*/
  //@API('Favorite object', {201: 'The object has been successfully favorited.'})
  @Post(':slug/favorite')
  async favorite(@User('id') userId: number, @Param('slug') slug: any) {
    return await this.objectService.favorite(userId, slug);
  }

  //@API('Unfavorite object', {200: 'The object has been successfully unfavorited.'})
  @Delete(':slug/favorite')
  async unFavorite(@User('id') userId: number, @Param('slug') slug: any) {
    return await this.objectService.unFavorite(userId, slug);
  }

}
