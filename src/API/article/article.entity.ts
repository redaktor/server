import BaseEntity, {
  Entity, Column, ManyToOne, OneToMany, JoinColumn
} from '../shared/base.entity';
import UserEntity from '../user/user.entity';
import CommentEntity from './comment.entity';

export interface ArticleRO {
  article: ArticleEntity;
}
export interface ArticlesRO {
  articles: ArticleEntity[];
  articlesCount: number;
}

export class CreateArticleDto {
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly tagList: string[] = [];
  readonly favorited: boolean = false;
}

@Entity('article')
export default class ArticleEntity extends BaseEntity {
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({default: ''})
  description: string;

  @Column({default: ''})
  body: string;

  @Column('simple-array')
  tagList: string[];

  @ManyToOne(type => UserEntity, user => user.articles)
  author: UserEntity;

  @OneToMany(type => CommentEntity, comment => comment.article, {eager: true})
  @JoinColumn()
  comments: CommentEntity[];

  @Column({default: 0})
  favoritesCount: number;

  @Column({default: false})
  favorited: boolean;
}
