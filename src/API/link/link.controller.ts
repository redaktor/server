import { Get,Post,Body,Query,Controller } from '@nestjs/common';
//import { CreateLinkDto, LinkRO, LinksRO } from './link.entity';
import LinkService from './link.service';

//@API({produces: 'application/json', tags: 'links'})
@Controller('links')
export default class LinkController {

  constructor(private readonly linkService: LinkService) {}

  //@API('Get all links')
  @Get()
  async findAll(@Query() query: any): Promise<any /*LinksRO*/> {
    return await this.linkService.findAll(query);
  }
  @Post()
  async create(@Body('link') linkData: any /*CreateLinkDto*/) {
    return this.linkService.create(linkData);
  }

  @Get('test')
  async test() {
    return this.linkService.test();
  }
/*
  @API('Get link feed')
  @Get('feed')
  async getFeed(@User('id') userId: number, @Query() query: any) {
    return await this.linkService.findFeed(userId, query);
  }

  @API('Find one link')
  @Get(':slug')
  async findOne(@Param('slug') slug: any): Promise<LinkRO | undefined> {
    return await this.linkService.findOne({slug});
  }

  @API('Find comments for an link')
  @Get(':slug/comments')
  async findComments(@Param('slug') slug: any): Promise<CommentsRO | undefined> {
    return await this.linkService.findComments(slug);
  }

  @API('Create link', {201: 'The link has been successfully created.'})
  @Post()
  async create(@User('id') userId: number, @Body('link') linkData: CreateLinkDto) {
    return this.linkService.create(userId, linkData);
  }

  @API('Update link', {201: 'The link has been successfully updated.'})
  @Put(':slug')
  async update(
    @User('id') userId: number, @Param() params: any,
    @Body('link') linkData: CreateLinkDto
  ) {
    // Todo: update slug also when title gets changed
    return this.linkService.update(params.slug, linkData);
  }

  @API('Delete link', {201: 'The link has been successfully deleted.'})
  @Delete(':slug')
  async delete(@User('id') userId: number, @Param() params: any) {
    return this.linkService.delete(params.slug);
  }

  @API('Create comment', {201: 'The comment has been successfully created.'})
  @Post(':slug/comments')
  async createComment(
    @User('id') userId: number, @Param('slug') slug: any,
    @Body('comment') commentData: CreateCommentDto
  ) {
    return await this.linkService.addComment(userId, slug, commentData);
  }

  @API('Delete comment', {201: 'The comment has been successfully deleted.'})
  @Delete(':slug/comments/:id')
  async deleteComment(@User('id') userId: number, @Param() params: any) {
    const {slug, id} = params;
    return await this.linkService.deleteComment(slug, id);
  }

  @API('Favorite link', {201: 'The link has been successfully favorited.'})
  @Post(':slug/favorite')
  async favorite(@User('id') userId: number, @Param('slug') slug: any) {
    return await this.linkService.favorite(userId, slug);
  }

  @API('Unfavorite link', {200: 'The link has been successfully unfavorited.'})
  @Delete(':slug/favorite')
  async unFavorite(@User('id') userId: number, @Param('slug') slug: any) {
    return await this.linkService.unFavorite(userId, slug);
  }
*/
}
