import BaseEntity from '../shared/base.entity';
import UserEntity from '../user/user.entity';
import CommentEntity from './comment.entity';
export interface ArticleRO {
    article: ArticleEntity;
}
export interface ArticlesRO {
    articles: ArticleEntity[];
    articlesCount: number;
}
export declare class CreateArticleDto {
    readonly title: string;
    readonly description: string;
    readonly body: string;
    readonly tagList: string[];
    readonly favorited: boolean;
}
export default class ArticleEntity extends BaseEntity {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    author: UserEntity;
    comments: CommentEntity[];
    favoritesCount: number;
    favorited: boolean;
}
