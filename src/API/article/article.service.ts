//import Ipfs from '../ipfs';
import request from '../shared/request.util';
import { getFriendsPort } from '../shared/port.util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import ArticleEntity, { CreateArticleDto, ArticleRO, ArticlesRO } from './article.entity';
import CommentEntity, { CreateCommentDto, CommentRO, CommentsRO } from './comment.entity';
import UserEntity from '../user/user.entity';
import FollowsEntity from '../profile/follows.entity';
import slug from '../../../framework/String/slug';
import uuid from '../../../framework/uuid';

interface ArticleQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export default class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>
  ) {}

  async create(id: number, articleData: CreateArticleDto): Promise<any> {
    const author = await this.userRepository.findOne(id);
    let article = Object.assign(new ArticleEntity(), {tagList:[], comments:[]}, articleData);
    article.slug = this.slugify(articleData.title);
    article = await this.articleRepository.save(article);
    if (!!author) {
      if (Array.isArray(author.articles)) {
        author.articles.push(article);
      } else {
        author.articles = [article];
      }
      await this.userRepository.save(author);

      const PORT = await getFriendsPort();
      const actor = await request(`http://localhost:${PORT}/profiles/APusername`);
      const { inbox } = JSON.parse(actor);
      console.log('AP inbox!', inbox);
/* IPFS
      const filesAdded = await Ipfs.add({
        '@context': 'https://www.w3.org/ns/activitystreams',
        type: 'Note',
        name: article.title,
        content: article.body,
        published: article.published,
        to: [inbox]
      });

      const { path, hash } = filesAdded[0];
      console.log('HASH', hash);
      const req = await request(`${inbox}`, {
        type: 'Create',
        actor: `http://localhost:${PORT}/${author.uid}`,
        object: `https://gateway.ipfs.io/ipfs/${hash}/`
      });
      console.log('Added file:', path, 'hash:', hash, 'post to:', inbox, 'REQ', req);
      */
      return {article};
    }
  }
  /*
  ArticleEntity {
    tagList: [],
    comments: [],
    loaded: false,
    title: 'Test2',
    description: 'test2',
    body: 'lorem',
    loading: true,
    slug: 'test2-a500de43-7e5b-4b03-9612-ebbb9ec428db',
    id: 4,
    published: 2019-01-31T11:59:27.000Z,
    updated: 2019-01-31T11:59:27.000Z,
    favoritesCount: 0,
    favorited: false
   }
  */
  async update(slug: string, articleData: any): Promise<ArticleRO> {
    // // TODO The slug also gets updated when the title is changed
    let toUpdate = await this.articleRepository.findOne({slug}, {relations: ['author']});
    let updated = Object.assign(toUpdate, articleData);
    const article = await this.articleRepository.save(updated);
    return {article};
  }

  async delete(slug: string): Promise<any> {
    return await this.articleRepository.delete({slug});
  }


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
      const author = await this.userRepository.findOne({username: query.author});
//console.log('findAll ROUTE author', author)
      if (!!author) { qb.andWhere("article.author.id = :id", { id: author.uid }) }
    }
    if ('favorited' in query) {
      const author = await this.userRepository.findOne({username: query.favorited});
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
    const article = await this.articleRepository.findOne(where, {relations: ['author']});
    return !!article ? { article } : void 0;
  }

  async addComment(id: number, slug: string, commentData: CreateCommentDto): Promise<CommentRO | undefined> {
    const author = await this.userRepository.findOne(id);
    let article = await this.articleRepository.findOne({slug});
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
    article = await this.articleRepository.save(article);
    return {comment: { ...comment, author }};
  }

  async deleteComment(slug: string, id: string): Promise<ArticleRO | undefined> {
    let article = await this.articleRepository.findOne({slug});
    const comment = await this.commentRepository.findOne(id);
    if(!article || !comment) return;
    const deleteIndex = article.comments.findIndex(_comment => _comment.uid === comment.uid);
    if (deleteIndex >= 0) {
      const deleteComments = article.comments.splice(deleteIndex, 1);
      await this.commentRepository.delete(deleteComments[0].uid);
      article = await this.articleRepository.save(article);
    }
    return {article};
  }

  async favorite(userId: number, slug: string): Promise<ArticleRO | undefined> {
    let article = await this.articleRepository.findOne({slug}, {relations: ['author']});
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
      article = await this.articleRepository.save(article);
    }
    return {article};
  }

  async unFavorite(userId: number, slug: string): Promise<ArticleRO | undefined> {
    let article = await this.articleRepository.findOne({slug}, {relations: ['author']});
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
      article = await this.articleRepository.save(article);
    }
    return {article};
  }

  async findComments(slug: string): Promise<CommentsRO | undefined> {
    const article = await this.articleRepository.findOne({slug}, {relations: ['author']});
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
}
