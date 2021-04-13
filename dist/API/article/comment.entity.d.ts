import BaseEntity from '../shared/base.entity';
import UserEntity from '../user/user.entity';
import ArticleEntity from './article.entity';
export interface CommentRO {
    comment: CommentEntity;
}
export interface CommentsRO {
    comments: CommentEntity[];
    commentsCount: number;
}
export declare class CreateCommentDto {
    readonly body: string;
}
export default class CommentEntity extends BaseEntity {
    body: string;
    article: ArticleEntity;
    author: UserEntity;
}
