import BaseEntity from '../shared/base.entity';
import {
  Entity, Column, Index, BeforeInsert, AfterLoad, AfterInsert, JoinColumn,
  OneToMany, OneToOne
} from "typeorm";
import { Any, string, optional } from '../../framework/validator';
import * as crypto from 'crypto';
//import { createUserToken } from './user.decorator';
import ActorEntity from '../actor/actor.entity';
// TODO :
/*
import ArticleEntity from '../article/article.entity';
import CommentEntity from '../article/comment.entity';
*/

export interface UserData {
  name: string;
  email: string;
  actors?: ActorEntity[];
  selectedActor?: ActorEntity;
}
export interface UserRO {
  user: UserEntity;
}
export interface MinApRO {
  [key: string]: any;
  id: string;
}

export class LoginUserDto {
  @Any() readonly password: string;
  @Any() readonly name: string;
}
export class CreateUserDto extends LoginUserDto {
  @Any(string.isEmail()) readonly email: string;
}
export class UpdateUserDto { /* TODO */
  @Any(optional, string) readonly name?: string;
  @Any(optional, string) readonly bio?: string;
  @Any(optional, string) readonly image?: string;
  @Any(optional, string.isEmail()) readonly email?: string;
}

@Entity('user')
export default class UserEntity extends BaseEntity {
  @BeforeInsert()
  hashPassword() {
    const l = 32;
    this.salt = crypto.randomBytes(Math.ceil(l/2)).toString('hex').slice(0,l);
    const hash = crypto.createHmac('sha512', this.salt);
    hash.update(this.password);
    this.password = hash.digest('hex');
  }

  @Index({ unique: true })
  @Column()
  name: string;

// VALIDATE
  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ select: false })
  salt: string;

  @Column({ select: false })
  password: string;

  // TODO :
	twoFactorSecret: string;
	twoFactorEnabled: boolean;
	twoFactorTempSecret?: string;

  @OneToMany(type => ActorEntity, actor => actor.user, { eager: true })
  actors: ActorEntity[];

  @OneToOne(type => ActorEntity)
  @JoinColumn()
  defaultActor: ActorEntity;

  @AfterInsert()
  @AfterLoad()
  toSelected() {
    if (!this.selectedActor) {
      this.selectedActor = this.defaultActor;
    }
  }
  @OneToOne(type => ActorEntity, { nullable: true, eager: true })
  @JoinColumn()
  selectedActor: ActorEntity;

/*
  @AfterInsert()
  @AfterLoad()
  generateToken() {
    this.token = createUserToken(this)
  }
  token: string;
*/

  // OLD :
  /*
  @OneToMany(type => ArticleEntity, object => object.author)
  articles: ArticleEntity[];

  @ManyToMany(type => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];

  @OneToMany(type => CommentEntity, comment => comment.author)
  comments: CommentEntity[];
  */
}
