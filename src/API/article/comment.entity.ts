import BaseEntity, { Entity, Column, ManyToOne } from '../shared/base.entity';
import UserEntity from '../user/user.entity';
import ArticleEntity from './article.entity';

export interface CommentRO {
  comment: CommentEntity;
}
export interface CommentsRO {
  comments: CommentEntity[];
  commentsCount: number;
}

export class CreateCommentDto {
  readonly body: string;
}

@Entity('comment')
export default class CommentEntity extends BaseEntity {
  @Column()
  body: string;

  @ManyToOne(type => ArticleEntity, article => article.comments)
  article: ArticleEntity;

  @ManyToOne(type => UserEntity, user => user.comments)
  author: UserEntity;
}
