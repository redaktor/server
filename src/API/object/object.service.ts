import Ipfs from '../../ipfs';
import request from '../shared/request.util';
import { getFriendsPort } from '../shared/port.util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import ObjectEntity, { CreateObjectDto, ObjectRO, ObjectsRO } from './object.entity';
import UserEntity from '../user/user.entity';
import FollowsEntity from '../profile/follows.entity';
import slug from '../../../framework/String/slug';
import uuid from '../../../framework/uuid';

interface ObjectQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export default class ObjectService {
  constructor(
    @InjectRepository(ObjectEntity)
    private readonly objectRepository: Repository<ObjectEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>
  ) {}

  async create(id: number, objectData: CreateObjectDto): Promise<any> {
    const author = await this.userRepository.findOne(id);
    let object = Object.assign(new ObjectEntity(), {tagList:[], comments:[]}, objectData);
    object.slug = this.slugify(objectData.title);
    object = await this.objectRepository.save(object);
    if (!!author) {

      if (Array.isArray(author.objects)) {
        author.objects.push(object);
      } else {
        author.objects = [object];
      }

      await this.userRepository.save(author);

      const PORT = await getFriendsPort();
      const actor = await request(`http://localhost:${PORT}/profiles/APusername`);
      const { inbox } = JSON.parse(actor);
      console.log('AP inbox!', inbox);

      const filesAdded = await Ipfs.add({
        '@context': 'https://www.w3.org/ns/activitystreams',
        type: 'Note',
        name: object.title,
        content: object.body,
        published: object.published,
        to: [inbox]
      });

      const { path, hash } = filesAdded[0];
      console.log('HASH', hash);
      const req = await request(`${inbox}`, {
        type: 'Create',
        actor: `http://localhost:${PORT}/${author.id}`,
        object: `https://gateway.ipfs.io/ipfs/${hash}/`
      });
      console.log('Added file:', path, 'hash:', hash, 'post to:', inbox, 'REQ', req);
      return {object};
    }
  }
  /*
  ObjectEntity {
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
    updatedAt: 2019-01-31T11:59:27.000Z,
    favoritesCount: 0,
    favorited: false
   }
  */
  async update(slug: string, objectData: any): Promise<ObjectRO> {
    // // TODO The slug also gets updated when the title is changed
    let toUpdate = await this.objectRepository.findOne({slug}, {relations: ['author']});
    let updated = Object.assign(toUpdate, objectData);
    const object = await this.objectRepository.save(updated);
    return {object};
  }

  async delete(slug: string): Promise<any> {
    return await this.objectRepository.delete({slug});
  }


  async findAll(query: ObjectQuery): Promise<ObjectsRO> {
    const qb = await getRepository(ObjectEntity)
      .createQueryBuilder('object')
      .leftJoinAndSelect('object.author', 'author');
    qb.where("1 = 1");
    if ('tag' in query) {
      qb.andWhere("object.tagList LIKE :tag", { tag: `%${query.tag}%` });
    }
//console.log('findAll ROUTE', query)
    if ('author' in query) {
      const author = await this.userRepository.findOne({name: query.author});
//console.log('findAll ROUTE author', author)
      if (!!author) { qb.andWhere("object.author.id = :id", { id: author.id }) }
    }
    if ('favorited' in query) {
      const author = await this.userRepository.findOne({name: query.favorited});
      if (!!author) {
        if (!author.favorites) { author.favorites = [] }
        const ids = author.favorites.map(el => el.id);
        qb.andWhere("object.author.id IN (:ids)", { ids });
      }
    }
    qb.orderBy('object.published', 'DESC');
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const objectsCount = await qb.getCount();
    const objects = await qb.getMany();
    return {objects, objectsCount};
  }

  async findFeed(id: number, query: ObjectQuery): Promise<ObjectsRO> {
    const _follows = await this.followsRepository.find( {followerId: id} );
    if (!_follows.length) { return {objects: [], objectsCount: 0} }
    const ids = _follows.map(el => el.followingId);

    const qb = await getRepository(ObjectEntity)
      .createQueryBuilder('object')
      .where('object.author.id IN (:ids)', { ids });
    qb.orderBy('object.published', 'DESC');
    const objectsCount = await qb.getCount();
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const objects = await qb.getMany();
    return {objects, objectsCount};
  }

  async findOne(where: any): Promise<ObjectRO | undefined> {
    const object = await this.objectRepository.findOne(where, {relations: ['author']});
    return !!object ? { object } : void 0;
  }

  async addComment(id: number, slug: string, commentData: CreateCommentDto): Promise<CommentRO | undefined> {
    const author = await this.userRepository.findOne(id);
    let object = await this.objectRepository.findOne({slug});
    const comment = new CommentEntity();
    comment.body = commentData.body;
    if(!author || !object) return;
    if (Array.isArray(author.comments)) {
      author.comments.push(comment);
    } else {
      author.comments = [comment];
    }
    object.comments.push(comment);
    await this.commentRepository.save(comment);
    object = await this.objectRepository.save(object);
    return {comment: { ...comment, author }};
  }

  async deleteComment(slug: string, id: string): Promise<ObjectRO | undefined> {
    let object = await this.objectRepository.findOne({slug});
    const comment = await this.commentRepository.findOne(id);
    if(!object || !comment) return;
    const deleteIndex = object.comments.findIndex(_comment => _comment.id === comment.id);
    if (deleteIndex >= 0) {
      const deleteComments = object.comments.splice(deleteIndex, 1);
      await this.commentRepository.delete(deleteComments[0].id);
      object = await this.objectRepository.save(object);
    }
    return {object};
  }

  async favorite(userId: number, slug: string): Promise<ObjectRO | undefined> {
    let object = await this.objectRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!object || !user) return;
    const { id } = object;
    const isNewFavorite = user.favorites.findIndex((_object: ObjectEntity) => {
      return _object.id === id
    }) < 0;
    if (isNewFavorite) {
      user.favorites.push(object);
      object.favorited = true;
      object.favoritesCount++;
      await this.userRepository.save(user);
      object = await this.objectRepository.save(object);
    }
    return {object};
  }

  async unFavorite(userId: number, slug: string): Promise<ObjectRO | undefined> {
    let object = await this.objectRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!object || !user) return;
    const { id } = object;
    const deleteIndex = user.favorites.findIndex((_object: ObjectEntity) => {
      return _object.id === id
    })
    if (deleteIndex >= 0) {
      user.favorites.splice(deleteIndex, 1);
      object.favoritesCount--;
      object.favorited = false;
      await this.userRepository.save(user);
      object = await this.objectRepository.save(object);
    }
    return {object};
  }

  async findComments(slug: string): Promise<CommentsRO | undefined> {
    const object = await this.objectRepository.findOne({slug}, {relations: ['author']});
    if(!object) return;
    const qb = await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where("1 = 1")
      .andWhere("comment.object.id = :id", { id: object.id })
      .orderBy('comment.published', 'DESC');
    const commentsCount = await qb.getCount();
    const comments = await qb.getMany();
    return {comments, commentsCount};
  }

  slugify(title: string) {
    return `${slug(title)}-${uuid()}`
  }
}
