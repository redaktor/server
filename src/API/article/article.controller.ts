import { Get,Post,Body,Put,Delete,Query,Param,Controller } from '@nestjs/common';
//import API from '../shared/API.decorator';
import { CreateArticleDto, ArticleRO, ArticlesRO } from './article.entity';
import { CreateCommentDto, CommentRO, CommentsRO } from './comment.entity';
import User from '../user/user.decorator';
import ArticleService from './article.service';

//@API({produces: 'application/json', tags: 'articles'})
@Controller('articles')
export default class ArticleController {

  constructor(private readonly articleService: ArticleService) {}

  //@API('Get all articles')
  @Get()
  async findAll(@Query() query: any): Promise<ArticlesRO> {
    return await this.articleService.findAll(query);
  }

  //@API('Get article feed')
  @Get('feed')
  async getFeed(@User('id') userId: number, @Query() query: any) {
    return await this.articleService.findFeed(userId, query);
  }

  //@API('Find one article')
  @Get(':slug')
  async findOne(@Param('slug') slug: any): Promise<ArticleRO | undefined> {
    return await this.articleService.findOne({slug});
  }

  //@API('Find comments for an article')
  @Get(':slug/comments')
  async findComments(@Param('slug') slug: any): Promise<CommentsRO | undefined> {
    return await this.articleService.findComments(slug);
  }

  //@API('Create article', {201: 'The article has been successfully created.'})
  @Post()
  async create(@User('id') userId: number, @Body('article') articleData: CreateArticleDto) {
    return this.articleService.create(userId, articleData);
  }

  //@API('Update article', {201: 'The article has been successfully updated.'})
  @Put(':slug')
  async update(
    @User('id') userId: number, @Param() params: any,
    @Body('article') articleData: CreateArticleDto
  ) {
    // Todo: update slug also when title gets changed
    return this.articleService.update(params.slug, articleData);
  }

  //@API('Delete article', {201: 'The article has been successfully deleted.'})
  @Delete(':slug')
  async delete(@User('id') userId: number, @Param() params: any) {
    return this.articleService.delete(params.slug);
  }

  //@API('Create comment', {201: 'The comment has been successfully created.'})
  @Post(':slug/comments')
  async createComment(
    @User('id') userId: number, @Param('slug') slug: any,
    @Body('comment') commentData: CreateCommentDto
  ) {
    return await this.articleService.addComment(userId, slug, commentData);
  }

  //@API('Delete comment', {201: 'The comment has been successfully deleted.'})
  @Delete(':slug/comments/:id')
  async deleteComment(@User('id') userId: number, @Param() params: any) {
    const {slug, id} = params;
    return await this.articleService.deleteComment(slug, id);
  }

  //@API('Favorite article', {201: 'The article has been successfully favorited.'})
  @Post(':slug/favorite')
  async favorite(@User('id') userId: number, @Param('slug') slug: any) {
    return await this.articleService.favorite(userId, slug);
  }

  //@API('Unfavorite article', {200: 'The article has been successfully unfavorited.'})
  @Delete(':slug/favorite')
  async unFavorite(@User('id') userId: number, @Param('slug') slug: any) {
    return await this.articleService.unFavorite(userId, slug);
  }

}
