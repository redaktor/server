import { Repository } from 'typeorm';
import ArticleEntity, { CreateArticleDto, ArticleRO, ArticlesRO } from './article.entity';
import CommentEntity, { CreateCommentDto, CommentRO, CommentsRO } from './comment.entity';
import UserEntity from '../user/user.entity';
import FollowsEntity from '../profile/follows.entity';
interface ArticleQuery {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
}
export default class ArticleService {
    private readonly articleRepository;
    private readonly commentRepository;
    private readonly userRepository;
    private readonly followsRepository;
    constructor(articleRepository: Repository<ArticleEntity>, commentRepository: Repository<CommentEntity>, userRepository: Repository<UserEntity>, followsRepository: Repository<FollowsEntity>);
    create(id: number, articleData: CreateArticleDto): Promise<any>;
    update(slug: string, articleData: any): Promise<ArticleRO>;
    delete(slug: string): Promise<any>;
    findAll(query: ArticleQuery): Promise<ArticlesRO>;
    findFeed(id: number, query: ArticleQuery): Promise<ArticlesRO>;
    findOne(where: any): Promise<ArticleRO | undefined>;
    addComment(id: number, slug: string, commentData: CreateCommentDto): Promise<CommentRO | undefined>;
    deleteComment(slug: string, id: string): Promise<ArticleRO | undefined>;
    favorite(userId: number, slug: string): Promise<ArticleRO | undefined>;
    unFavorite(userId: number, slug: string): Promise<ArticleRO | undefined>;
    findComments(slug: string): Promise<CommentsRO | undefined>;
    slugify(title: string): string;
}
export {};
