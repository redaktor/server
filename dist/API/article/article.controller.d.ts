import { CreateArticleDto, ArticleRO, ArticlesRO } from './article.entity';
import { CreateCommentDto, CommentRO, CommentsRO } from './comment.entity';
import ArticleService from './article.service';
export default class ArticleController {
    private readonly articleService;
    constructor(articleService: ArticleService);
    findAll(query: any): Promise<ArticlesRO>;
    getFeed(userId: number, query: any): Promise<ArticlesRO>;
    findOne(slug: any): Promise<ArticleRO | undefined>;
    findComments(slug: any): Promise<CommentsRO | undefined>;
    create(userId: number, articleData: CreateArticleDto): Promise<any>;
    update(userId: number, params: any, articleData: CreateArticleDto): Promise<ArticleRO>;
    delete(userId: number, params: any): Promise<any>;
    createComment(userId: number, slug: any, commentData: CreateCommentDto): Promise<CommentRO>;
    deleteComment(userId: number, params: any): Promise<ArticleRO>;
    favorite(userId: number, slug: any): Promise<ArticleRO>;
    unFavorite(userId: number, slug: any): Promise<ArticleRO>;
}
