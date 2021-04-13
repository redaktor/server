//import Ipfs from '../ipfs';
//import request from '../shared/request.util';
//import { getFriendsPort } from '../shared/port.util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
//import LinkService from '../link/link.service';
import ActorEntity, { CreateActorDto, ActorRO } from './actor.entity';
import SettingsEntity from './settings.entity';
import TypeEntity from '../object/type.entity';

@Injectable()
export default class ActorService {
  constructor(
    @InjectRepository(ActorEntity)
    private readonly actorRepository: Repository<ActorEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
    @InjectRepository(TypeEntity)
    private readonly typeRepository: Repository<TypeEntity>,
    //private readonly linkService: LinkService
  ) {}

  static createBase(objectData: CreateActorDto) {

  }

  async create(actorData: CreateActorDto, persist = true): Promise<ActorRO> {
    //console.log('actorData', actorData);
    let actor: any = this.actorRepository.create();
    actor.type = await this.typeRepository.save({
      text: actorData.type || 'Person'
    });

    // TODO merge create ObjectBaseEntity
    if (!actorData.user) { return { actor } }
    actor.user = actorData.user;
    actor.preferredUsername = actorData.preferredUsername;
    actor.lastFetchedAt = Date.now();
    actor.settings = this.settingsRepository.create({});
    if (persist) { actor = await this.actorRepository.save(actor) }
    console.log('actor', { actor });
    return { actor }
  }

  async update(uid: number, actorData: CreateActorDto): Promise<ActorRO> {

    let toUpdate = await this.actorRepository.findOne({uid}, {relations: ['author']});
    let updated = Object.assign(toUpdate, actorData);
    const actor = await this.actorRepository.save(updated);
    return { actor };

  }

  async delete(uid: number): Promise<any> {
    return await this.actorRepository.delete({uid});
  }

/*
  async findAll(query: ArticleQuery): Promise<ArticlesRO> {
    const qb = await getRepository(ArticleEntity)
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');
    qb.where("1 = 1");
    if ('tag' in query) {
      qb.andWhere("article.tagList LIKE :tag", { tag: `%${query.tag}%` });
    }
//console.log('findAll ROUTE', query)
    if ('author' in query) {
      const author = await this.userRepository.findOne({name: query.author});
//console.log('findAll ROUTE author', author)
      if (!!author) { qb.andWhere("article.author.id = :id", { id: author.uid }) }
    }
    if ('favorited' in query) {
      const author = await this.userRepository.findOne({name: query.favorited});
      if (!!author) {
        if (!author.favorites) { author.favorites = [] }
        const ids = author.favorites.map(el => el.uid);
        qb.andWhere("article.author.id IN (:ids)", { ids });
      }
    }
    qb.orderBy('article.published', 'DESC');
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const articlesCount = await qb.getCount();
    const articles = await qb.getMany();
    return {articles, articlesCount};
  }

  async findFeed(id: number, query: ArticleQuery): Promise<ArticlesRO> {
    const _follows = await this.followsRepository.find( {followerId: id} );
    if (!_follows.length) { return {articles: [], articlesCount: 0} }
    const ids = _follows.map(el => el.followingId);

    const qb = await getRepository(ArticleEntity)
      .createQueryBuilder('article')
      .where('article.author.id IN (:ids)', { ids });
    qb.orderBy('article.published', 'DESC');
    const articlesCount = await qb.getCount();
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const articles = await qb.getMany();
    return {articles, articlesCount};
  }

  async findOne(where: any): Promise<ArticleRO | undefined> {
    const article = await this.actorRepository.findOne(where, {relations: ['author']});
    return !!article ? { article } : void 0;
  }

  async addComment(id: number, slug: string, commentData: CreateCommentDto): Promise<CommentRO | undefined> {
    const author = await this.userRepository.findOne(id);
    let article = await this.actorRepository.findOne({slug});
    const comment = new CommentEntity();
    comment.body = commentData.body;
    if(!author || !article) return;
    if (Array.isArray(author.comments)) {
      author.comments.push(comment);
    } else {
      author.comments = [comment];
    }
    article.comments.push(comment);
    await this.commentRepository.save(comment);
    article = await this.actorRepository.save(article);
    return {comment: { ...comment, author }};
  }

  async deleteComment(slug: string, id: string): Promise<ArticleRO | undefined> {
    let article = await this.actorRepository.findOne({slug});
    const comment = await this.commentRepository.findOne(id);
    if(!article || !comment) return;
    const deleteIndex = article.comments.findIndex(_comment => _comment.uid === comment.uid);
    if (deleteIndex >= 0) {
      const deleteComments = article.comments.splice(deleteIndex, 1);
      await this.commentRepository.delete(deleteComments[0].uid);
      article = await this.actorRepository.save(article);
    }
    return {article};
  }

  async favorite(userId: number, slug: string): Promise<ArticleRO | undefined> {
    let article = await this.actorRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!article || !user) return;
    const { uid } = article;
    const isNewFavorite = user.favorites.findIndex((_article: ArticleEntity) => {
      return _article.uid === uid
    }) < 0;
    if (isNewFavorite) {
      user.favorites.push(article);
      article.favorited = true;
      article.favoritesCount++;
      await this.userRepository.save(user);
      article = await this.actorRepository.save(article);
    }
    return {article};
  }

  async unFavorite(userId: number, slug: string): Promise<ArticleRO | undefined> {
    let article = await this.actorRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!article || !user) return;
    const { uid } = article;
    const deleteIndex = user.favorites.findIndex((_article: ArticleEntity) => {
      return _article.uid === uid
    })
    if (deleteIndex >= 0) {
      user.favorites.splice(deleteIndex, 1);
      article.favoritesCount--;
      article.favorited = false;
      await this.userRepository.save(user);
      article = await this.actorRepository.save(article);
    }
    return {article};
  }

  async findComments(slug: string): Promise<CommentsRO | undefined> {
    const article = await this.actorRepository.findOne({slug}, {relations: ['author']});
    if(!article) return;
    const qb = await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where("1 = 1")
      .andWhere("comment.article.uid = :uid", { uid: article.uid })
      .orderBy('comment.published', 'DESC');
    const commentsCount = await qb.getCount();
    const comments = await qb.getMany();
    return {comments, commentsCount};
  }

  slugify(title: string) {
    return `${slug(title)}-${uuid()}`
  }
  */
}
