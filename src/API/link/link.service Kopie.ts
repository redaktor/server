
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import UrlEntity, { UrlRO, CreateHostBlockDto, CreatePathBlockDto } from './url.entity';
import BlockEntity from './block.entity';
import HostEntity from './host.entity';
import PathEntity from './path.entity';
import QueryEntity from './query.entity';
import HashEntity from "./hash.entity";

function pick<T, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
  return { ...paths.reduce((mem, key) => ({ ...mem, [key]: obj[key] }), {}) } as Pick<T, K>;
}

interface UrlQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  order?: any;
  where?: any;
  take?: number;
  skip?: number;
}

@Injectable()
export default class UrlService {
  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepository: Repository<UrlEntity>,
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
    @InjectRepository(HostEntity)
    private readonly hostRepository: Repository<HostEntity>,
    @InjectRepository(PathEntity)
    private readonly pathRepository: Repository<PathEntity>,
    @InjectRepository(QueryEntity)
    private readonly queryRepository: Repository<QueryEntity>,
    @InjectRepository(HashEntity)
    private readonly hashRepository: Repository<HashEntity>
  ) {}

  async blockedParents(urlData: any) {
    const pathArr = urlData.path.split('/');
    return !pathArr.length ? [] : await this.urlRepository.createQueryBuilder('url')
      .innerJoin('url.host', 'host')
      .innerJoinAndSelect('url.path', 'path')
      .leftJoinAndSelect('url.block', 'block')
      .where('host.host = :host', {host: urlData.host})
      // TODO : is block.recursive :
      .andWhere('block.recursive = :rblock', {rblock: true})
      //.andWhere('url.recursive_block = :rblock', {rblock: true})
      .andWhere(new Brackets(qb => {
        qb.where('path.path = :path', {path: pathArr[0]})
          .orWhere('path.path LIKE :lpath', {lpath: `${pathArr[0]}/%`})
      }))
      .getMany();
  }

  async create(urlString: string): Promise<UrlRO> {
    const urlData = this.input(urlString);
    const urlRelations: any = {};
    const keys: (keyof UrlEntity)[] = ['host', 'path', 'query', 'hash', 'auth'];
    let blockedPaths: any[] = [];
    await Promise.all(keys.map(async (k) => {
      if (!!urlData[k]) {
        const def = {[k]: urlData[k]};
        urlRelations[k] = await (<any>this)[`${k}Repository`].findOne(def);
        if (!urlRelations[k]) {
          urlRelations[k] = (<any>this)[`${k}Repository`].create(def);
          await (<any>this)[`${k}Repository`].save(urlRelations[k]);
        }
        if (k === 'path' && !!urlData.path) {
          blockedPaths = await this.blockedParents(urlData)
        }
      }
      return k
    }));

    console.log('blockedPaths0', blockedPaths);

    const blockProps = ['media', 'reports', 'content'];
    blockedPaths = Object.assign({},
      ...blockedPaths.map(o => (!!o.block ? {path: o.path, block: o.block} : {})).reverse(),
      !!urlRelations.host.block ? { path: null, block: urlRelations.host.block } : {}
      //pick(urlRelations.host, blockProps)
    );

    console.log('blockedPaths', blockedPaths);

    let href: any = this.urlRepository.create({...urlData, ...urlRelations, ...{recursive_block: true}});
    href = await this.urlRepository.save(href);
    return {href};
  }
/*
  async hostStatus(block: CreateHostBlockDto): Promise<UrlEntity> {

  }
*/
  async pathStatus(blockDto: CreatePathBlockDto): Promise<BlockEntity> {
    const block = new BlockEntity();
    block.silence = !!blockDto.silence ? blockDto.silence : false;
    block.content = !!blockDto.content ? blockDto.content : false;
    block.media = !!blockDto.content ? true : (!!blockDto.media ? blockDto.media : false);
    block.reports = !!blockDto.content ? true : (!!blockDto.reports ? blockDto.reports : false);
    block.recursive = !!blockDto.recursive ? blockDto.recursive : false;
    await this.blockRepository.save(block);


    await this.urlRepository.createQueryBuilder('url')
      .relation(UrlEntity, "block")
      .of(blockDto.href)
      .set(block);
    return block
  }

  async findAll(query: UrlQuery = {}): Promise<any/*UrlsRO*/> {
    if (!query.order) { query.order = { uid: 'DESC' } }
    let _urls = await this.urlRepository.find(query);
    console.log(_urls);
    return {urls: _urls.map(this.output)};
  }

  async deleteEmptyRelations(from: any, keys: string|string[], condition: any = {}): Promise<any> {
    if (typeof keys === 'string') { keys = [keys] }
    return await Promise.all(keys.map(async (k) => {
      if (!!from[k]) {
        let count = await this.urlRepository.count({[k]: {...from[k], ...condition}});
        if (count === 0) {
          await (<any>this)[`${k}Repository`].remove(from[k]);
        }
      }
      return k
    }));
  }

  async delete(id: number): Promise<any> {
    const toDelete: any = await this.urlRepository.findOne(id);
    if (!!toDelete) {
      const deleted = await this.urlRepository.remove(toDelete);
      await this.deleteEmptyRelations(toDelete, ['path', 'query', 'hash']);
      // Keep blocked hosts for future rejects ...
      await this.deleteEmptyRelations(toDelete, 'host', {is_suspended: false});
      return deleted
    }
  }


  input(urlString: string): any {
    if (typeof urlString === 'string') {
      try {
        const u: any = new URL(urlString);
        if (!u.path && !!u.pathname) {
          u.path = u.pathname.replace(/^\//,'').replace(/\/$/,'')
        }
        if (!u.query && !!u.search) {
          u.query = u.search.replace(/^[?]/,'')
        }
        if (!!u.hash) {
          Object.defineProperty(u, 'hash', {value: u.hash.replace(/^[#]/,'')})
        }
        if (!!u.username) {
          u.auth = `${u.username}${!!u.password ? ':'+u.password : ''}`;
        }
        return u
      } catch(e) {
        throw new HttpException({
          message: `${urlString} is not a valid URL`
        }, HttpStatus.BAD_REQUEST);
      }
    }
    return urlString
  }
  output(url: UrlEntity) {
    return {
      url: `${url.protocol}://${url.auth ? url.auth.auth+'@' : ''}${url.host.host}` +
      `${url.port ? ':'+url.port : ''}${url.path ? '/'+url.path.path : ''}` +
      `${url.query ? '?'+url.query.query : ''}${url.hash ? '#'+url.hash.hash : ''}`/*,
      severity: url.host.severity,
      blockMedia: url.host.block_media,
      blockReports: url.host.block_reports*/
    }
  }


  async test() {
    const u1 = await this.create('https://sebastianlasse.de/test?a=b#1');
    await this.pathStatus({ href: u1.href, content: true, recursive: true });
    await this.create('https://sebastianlasse.de/test/path2?a=b#1');
    await this.create('https://sebastianlasse.de/test/path2/path3?a=b#1');
    await this.delete(1);
    //await this.delete(2);
    //return await this.queryRepository.find();
    return await this.findAll();
  }
  /*


  async update(slug: string, urlData: any): Promise<UrlRO> {
    // // TODO The slug also gets updated when the title is changed
    let toUpdate = await this.urlRepository.findOne({slug}, {relations: ['author']});
    let updated = Object.assign(toUpdate, urlData);
    const url = await this.urlRepository.save(updated);
    return {url};
  }

  async delete(slug: string): Promise<any> {
    return await this.urlRepository.delete({slug});
  }


  async findAll(query: UrlQuery): Promise<UrlsRO> {
    const qb = await getRepository(UrlEntity)
      .createQueryBuilder('url')
      .leftJoinAndSelect('url.author', 'author');
    qb.where("1 = 1");
    if ('tag' in query) {
      qb.andWhere("url.tagList LIKE :tag", { tag: `%${query.tag}%` });
    }
//console.log('findAll ROUTE', query)
    if ('author' in query) {
      const author = await this.userRepository.findOne({username: query.author});
//console.log('findAll ROUTE author', author)
      if (!!author) { qb.andWhere("url.author.id = :id", { id: author.id }) }
    }
    if ('favorited' in query) {
      const author = await this.userRepository.findOne({username: query.favorited});
      if (!!author) {
        if (!author.favorites) { author.favorites = [] }
        const ids = author.favorites.map(el => el.id);
        qb.andWhere("url.author.id IN (:ids)", { ids });
      }
    }
    qb.orderBy('url.published', 'DESC');
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const urlsCount = await qb.getCount();
    const urls = await qb.getMany();
    return {urls, urlsCount};
  }

  async findFeed(id: number, query: UrlQuery): Promise<UrlsRO> {
    const _follows = await this.followsRepository.find( {followerId: id} );
    if (!_follows.length) { return {urls: [], urlsCount: 0} }
    const ids = _follows.map(el => el.followingId);

    const qb = await getRepository(UrlEntity)
      .createQueryBuilder('url')
      .where('url.author.id IN (:ids)', { ids });
    qb.orderBy('url.published', 'DESC');
    const urlsCount = await qb.getCount();
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const urls = await qb.getMany();
    return {urls, urlsCount};
  }

  async findOne(where: any): Promise<UrlRO | undefined> {
    const url = await this.urlRepository.findOne(where, {relations: ['author']});
    return !!url ? { url } : void 0;
  }

  async addComment(id: number, slug: string, commentData: CreateCommentDto): Promise<CommentRO | undefined> {
    const author = await this.userRepository.findOne(id);
    let url = await this.urlRepository.findOne({slug});
    const comment = new CommentEntity();
    comment.body = commentData.body;
    if(!author || !url) return;
    if (Array.isArray(author.comments)) {
      author.comments.push(comment);
    } else {
      author.comments = [comment];
    }
    url.comments.push(comment);
    await this.commentRepository.save(comment);
    url = await this.urlRepository.save(url);
    return {comment: { ...comment, author }};
  }

  async deleteComment(slug: string, id: string): Promise<UrlRO | undefined> {
    let url = await this.urlRepository.findOne({slug});
    const comment = await this.commentRepository.findOne(id);
    if(!url || !comment) return;
    const deleteIndex = url.comments.findIndex(_comment => _comment.id === comment.id);
    if (deleteIndex >= 0) {
      const deleteComments = url.comments.splice(deleteIndex, 1);
      await this.commentRepository.delete(deleteComments[0].id);
      url = await this.urlRepository.save(url);
    }
    return {url};
  }

  async favorite(userId: number, slug: string): Promise<UrlRO | undefined> {
    let url = await this.urlRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!url || !user) return;
    const { id } = url;
    const isNewFavorite = user.favorites.findIndex((_url: UrlEntity) => {
      return _url.id === id
    }) < 0;
    if (isNewFavorite) {
      user.favorites.push(url);
      url.favorited = true;
      url.favoritesCount++;
      await this.userRepository.save(user);
      url = await this.urlRepository.save(url);
    }
    return {url};
  }

  async unFavorite(userId: number, slug: string): Promise<UrlRO | undefined> {
    let url = await this.urlRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!url || !user) return;
    const { id } = url;
    const deleteIndex = user.favorites.findIndex((_url: UrlEntity) => {
      return _url.id === id
    })
    if (deleteIndex >= 0) {
      user.favorites.splice(deleteIndex, 1);
      url.favoritesCount--;
      url.favorited = false;
      await this.userRepository.save(user);
      url = await this.urlRepository.save(url);
    }
    return {url};
  }

  async findComments(slug: string): Promise<CommentsRO | undefined> {
    const url = await this.urlRepository.findOne({slug}, {relations: ['author']});
    if(!url) return;
    const qb = await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where("1 = 1")
      .andWhere("comment.url.id = :id", { id: url.id })
      .orderBy('comment.published', 'DESC');
    const commentsCount = await qb.getCount();
    const comments = await qb.getMany();
    return {comments, commentsCount};
  }

  slugify(title: string) {
    return `${slug(title)}-${uuid()}`
  }  */
}
