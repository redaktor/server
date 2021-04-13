
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import LinkEntity, {
  LinkRO, CreateLinkDto, CreateBlockDto, QueryLinkDto, QueryFullLinkDto,
  plainRelations
} from './link.entity';
import BlockEntity from './block.entity';
import HostEntity from './host.entity';
import AuthEntity from './auth.entity';
import PathEntity from './path.entity';
import QueryEntity from './query.entity';
import HashEntity from "./hash.entity";

interface LinkQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  order?: any;
  where?: any;
  take?: number;
  skip?: number;
}
type Qkey = keyof QueryFullLinkDto;

@Injectable()
export default class LinkService {
  constructor(
    @InjectRepository(LinkEntity)
    private readonly linkRepository: Repository<LinkEntity>,
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
    @InjectRepository(HostEntity)
    private readonly hostRepository: Repository<HostEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    @InjectRepository(PathEntity)
    private readonly pathRepository: Repository<PathEntity>,
    @InjectRepository(QueryEntity)
    private readonly queryRepository: Repository<QueryEntity>,
    @InjectRepository(HashEntity)
    private readonly hashRepository: Repository<HashEntity>
  ) {}

  protected joins: Qkey[] = ['host', 'auth', 'path', 'hash', 'query', 'preview'];
  protected props = ['protocol','port','rel','height','width','hreflang','mediaType'];

  async create(linkOrUrlString: CreateLinkDto | string, persist = true): Promise<LinkRO> {
    const linkData = {
      ...{
        protocol: 'https', port: null,
        height: null, width: null, hreflang: null, mediaType: 'text/html',

      },
      ...this.input(linkOrUrlString)
    };
    const linkRelations: any = {};
    let blockedParents: any[] = [];
    await Promise.all(this.joins.map(async (k) => {
      if (!!linkData[k]) {
        const def = {text: linkData[k]};
        linkRelations[k] = await (<any>this)[`${k}Repository`].findOne(def);
        if (!linkRelations[k]) {
          linkRelations[k] = (<any>this)[`${k}Repository`].create(def);
          await (<any>this)[`${k}Repository`].save(linkRelations[k]);
        }
        if (k === 'path' && !!linkData.path) {
          blockedParents = await this.pathTree(linkData, true, false)
        }
      }
      return k
    }));
    const blocked = Object.assign({},
      ...blockedParents.map(o => (!!o.block ? {path: o.path, block: o.block} : {})).reverse(),
      !!linkRelations.host.block ? { path: null, block: linkRelations.host.block } : {}
    );

    console.log(':check exists:!', {
      ...linkData,
      ...linkRelations,
      ...(!!blocked.block ? {block: blocked.block} : {})
    });
    const existing: any = await this.findOne({
      ...linkData,
      ...linkRelations,
      ...(!!blocked.block ? {block: blocked.block} : {})
    });
    if (existing) {
      console.log('::1!', existing);
      return { link: existing };
    }

    let link: any = this.linkRepository.create({
      ...linkData,
      ...linkRelations,
      ...(!!blocked.block ? {block: blocked.block} : {})
    });

    if (persist) { link = await this.linkRepository.save(link) }
    return { link };
  }

  async setBlockStatus(blockDto: CreateBlockDto): Promise<BlockEntity[]> {
    const block = new BlockEntity();
    block.silence = !!blockDto.silence;
    block.content = !!blockDto.content;
    block.media = !!blockDto.media;
    block.reports = !!blockDto.reports;
    block.recursive = !!blockDto.blockHost || !!blockDto.recursive;
    block.blockHost = !!blockDto.blockHost;
    let blocks = [block];

    let blockedChildren: any[] = []
    const current = await this.linkRepository.findOne(blockDto.link.uid, {
      relations: ['host', 'path']
    });
    const wasRecursive = !!current && !!current.block && !!current.block.recursive;
    if (!!wasRecursive && !block.recursive) {
      blockedChildren = await this.pathTree(current, true, true);
    } else if (!!block.recursive) {
      blockedChildren = await this.pathTree(current, true, true);
    }
    blocks = blocks.concat(blockedChildren)

    await Promise.all(blocks.map(async (b) => {
      await this.blockRepository.save(b);
      await (this.linkRepository).createQueryBuilder('link')
        .relation(LinkEntity, "block")
        .of(blockDto.link)
        .set(b);
    }));

    if (current && block.blockHost) {
      await (this.hostRepository).createQueryBuilder('link')
        .relation(HostEntity, "block")
        .of(current.host)
        .set(block);
    }
    return blocks
  }

  async findOne(query: QueryLinkDto = {}): Promise<LinkEntity | undefined> {
    return this.findQuery(query).getOne()
  }

  async findAll(query: QueryLinkDto = {}): Promise<LinkEntity[] | []> {
    return this.findQuery(query).getMany()
  }

  async delete(id: number): Promise<any> {
    const toDelete: any = await this.linkRepository.findOne(id);
    if (!!toDelete) {
      const deleted = await this.linkRepository.remove(toDelete);
      await this.deleteEmptyRelations(toDelete, ['path', 'query', 'hash', 'auth']);
      // Keep blocked hosts for future rejects ...
      await this.deleteEmptyRelations(toDelete, 'host', {is_suspended: false});
      return deleted
    }
  }

  protected findQuery(o: QueryLinkDto = {}) {
    if (typeof o === 'string') { o = {href: o} };
    if (!(o instanceof QueryFullLinkDto) && !!o.href) {
      o = this.input(o);
      delete (<any>o).href;
    }
    const q: QueryFullLinkDto = o;
    const hasProp = (k: Qkey) => (q.hasOwnProperty(k) && typeof q[k] !== 'undefined');
    const joined = (k: Qkey) => q[k] === null ? `link.${k} is NULL` : `${k}.text = :${k}`;
    const param = (k: Qkey) => q[k] === null ? `link.${k} is NULL` : `link.${k} = :${k}`;

    const qb = this.linkRepository.createQueryBuilder('link');
    this.joins.concat(['block']).forEach((k: any) => qb.leftJoinAndSelect(`link.${k}`, k));
    this.props.forEach((k: any) => hasProp(k) && qb.andWhere(param(k), q));
    this.joins.forEach((k: any) => hasProp(k) && qb.andWhere(joined(k), q)); // TODO 'preview'
    return qb.orderBy('link.published', 'DESC');
  }

  protected input(linkOrUrlString: CreateLinkDto | string): QueryFullLinkDto {
    const linkData = typeof linkOrUrlString === 'string' ?
      {href: linkOrUrlString} : linkOrUrlString;
    let u: any;
    try {
      u = new URL(linkData.href);
    } catch(e) {
      const message = `${linkData.href} is not a valid URL`;
      throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
    }
    const o: any = { protocol: u.protocol, host: u.host, port: u.port || null };
    o.auth = (!u.auth && !!u.username) ?
      `${u.username}${!!u.password ? ':'+u.password : ''}` : null;
    o.path = (!u.path && !!u.pathname) ?
      u.pathname.replace(/^\//,'').replace(/\/$/,'') : null;
    o.query = (!u.query && !!u.search) ? u.search.replace(/^[?]/,'') : null;
    o.hash = !!u.hash ? u.hash.replace(/^[#]/,'') : null;
    return { ...linkData, ...o }
  }

  protected async pathTree(linkData: any, isBlocked: any = false, isChildren = false) {
    console.log(linkData);
    const pathArr = !!linkData.path ? linkData.path.split('/') : [];
    const lpath = !!isChildren ? `%/${pathArr[pathArr.length-1]}` : `${pathArr[0]}/%`;
    return !pathArr.length ? Promise.resolve([]) : await this.linkRepository.createQueryBuilder('link')
      .innerJoin('link.host', 'host')
      .innerJoinAndSelect('link.path', 'path')
      .leftJoinAndSelect('link.block', 'block')
      .where('host.text = :host', {host: linkData.host})
      .andWhere(isBlocked === null ? '1 = 1' : 'block.recursive = :rblock', {rblock: isBlocked})
      .andWhere( (isChildren ? 'path.text LIKE :lpath' : new Brackets(qb => {
          qb.where('path.text = :path', {path: pathArr[0]})
            .orWhere('path.text LIKE :lpath', {lpath})
        })), {lpath}
      ).getMany();
  }

  async deleteEmptyRelations(from: any, keys: string|string[], condition: any = {}): Promise<any> {
    if (typeof keys === 'string') { keys = [keys] }
    return await Promise.all(keys.map(async (k) => {
      if (!!from[k]) {
        let count = await this.linkRepository.count({[k]: {...from[k], ...condition}});
        if (count === 0) {
          await (<any>this)[`${k}Repository`].remove(from[k]);
        }
      }
      return k
    }));
  }

  async test() {
//    const u1 = await this.create('https://sebastianlasse.de/test?a=b#1');
//    await this.create('https://sebastianlasse.de/test?a=b#1');
//    const u2 = await this.create('https://sebastianlasse.de/test/path2?a=b');
//    await this.setBlockStatus({ link: u1.link, content: true, recursive: true });
//    await this.setBlockStatus({ link: u2.link, content: false, recursive: false });
//    await this.create('https://sebastianlasse.de/test/path2/path3?a=b#1');
    const u3 = await this.create('https://example.com/test');
    await this.setBlockStatus({ ...u3, ...{ content: true, recursive: true, blockHost: true }});

    await this.create({
      href: 'https://example.com/test/path2',
      rel: 'me'/*,
      preview: {
          "type": "Video",
          "name": "Trailer",
          "duration": "PT1M",
          "url": {
            "href": "http://example.org/trailer.mkv",
            "mediaType": "video/mkv"
          }
        }*/
    });

    await this.create({ href: 'https://example.com/test/path2', rel: 'me'});
  //  await this.delete(3);


    console.log('finding');
    const found = await this.findOne('https://example.com/test/path2')
    console.log('found', found)
    const s = await this.findAll({host: 'example.com'});
    console.log('found2', s)

    return await this.findAll();
  }
  /*


  async update(slug: string, linkData: any): Promise<LinkRO> {
    // // TODO The slug also gets updated when the title is changed
    let toUpdate = await this.linkRepository.findOne({slug}, {relations: ['author']});
    let updated = Object.assign(toUpdate, linkData);
    const link = await this.linkRepository.save(updated);
    return {link};
  }

  async delete(slug: string): Promise<any> {
    return await this.linkRepository.delete({slug});
  }


  async findAll(query: LinkQuery): Promise<LinksRO> {
    const qb = await getRepository(LinkEntity)
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.author', 'author');
    qb.where('1 = 1');
    if ('tag' in query) {
      qb.andWhere("link.tagList LIKE :tag", { tag: `%${query.tag}%` });
    }
//console.log('findAll ROUTE', query)
    if ('author' in query) {
      const author = await this.userRepository.findOne({username: query.author});
//console.log('findAll ROUTE author', author)
      if (!!author) { qb.andWhere("link.author.id = :id", { id: author.id }) }
    }
    if ('favorited' in query) {
      const author = await this.userRepository.findOne({username: query.favorited});
      if (!!author) {
        if (!author.favorites) { author.favorites = [] }
        const ids = author.favorites.map(el => el.id);
        qb.andWhere("link.author.id IN (:ids)", { ids });
      }
    }
    qb.orderBy('link.published', 'DESC');
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const linksCount = await qb.getCount();
    const links = await qb.getMany();
    return {links, linksCount};
  }

  async findFeed(id: number, query: LinkQuery): Promise<LinksRO> {
    const _follows = await this.followsRepository.find( {followerId: id} );
    if (!_follows.length) { return {links: [], linksCount: 0} }
    const ids = _follows.map(el => el.followingId);

    const qb = await getRepository(LinkEntity)
      .createQueryBuilder('link')
      .where('link.author.id IN (:ids)', { ids });
    qb.orderBy('link.published', 'DESC');
    const linksCount = await qb.getCount();
    if ('limit' in query) {
      qb.limit(query.limit);
    }
    if ('offset' in query) {
      qb.offset(query.offset);
    }
    const links = await qb.getMany();
    return {links, linksCount};
  }

  async findOne(where: any): Promise<LinkRO | undefined> {
    const link = await this.linkRepository.findOne(where, {relations: ['author']});
    return !!link ? { link } : void 0;
  }

  async addComment(id: number, slug: string, commentData: CreateCommentDto): Promise<CommentRO | undefined> {
    const author = await this.userRepository.findOne(id);
    let link = await this.linkRepository.findOne({slug});
    const comment = new CommentEntity();
    comment.body = commentData.body;
    if(!author || !link) return;
    if (Array.isArray(author.comments)) {
      author.comments.push(comment);
    } else {
      author.comments = [comment];
    }
    link.comments.push(comment);
    await this.commentRepository.save(comment);
    link = await this.linkRepository.save(link);
    return {comment: { ...comment, author }};
  }

  async deleteComment(slug: string, id: string): Promise<LinkRO | undefined> {
    let link = await this.linkRepository.findOne({slug});
    const comment = await this.commentRepository.findOne(id);
    if(!link || !comment) return;
    const deleteIndex = link.comments.findIndex(_comment => _comment.id === comment.id);
    if (deleteIndex >= 0) {
      const deleteComments = link.comments.splice(deleteIndex, 1);
      await this.commentRepository.delete(deleteComments[0].id);
      link = await this.linkRepository.save(link);
    }
    return {link};
  }

  async favorite(userId: number, slug: string): Promise<LinkRO | undefined> {
    let link = await this.linkRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!link || !user) return;
    const { id } = link;
    const isNewFavorite = user.favorites.findIndex((_link: LinkEntity) => {
      return _link.id === id
    }) < 0;
    if (isNewFavorite) {
      user.favorites.push(link);
      link.favorited = true;
      link.favoritesCount++;
      await this.userRepository.save(user);
      link = await this.linkRepository.save(link);
    }
    return {link};
  }

  async unFavorite(userId: number, slug: string): Promise<LinkRO | undefined> {
    let link = await this.linkRepository.findOne({slug}, {relations: ['author']});
    const user = await this.userRepository.findOne(userId, {relations: ['favorites']});
    if(!link || !user) return;
    const { id } = link;
    const deleteIndex = user.favorites.findIndex((_link: LinkEntity) => {
      return _link.id === id
    })
    if (deleteIndex >= 0) {
      user.favorites.splice(deleteIndex, 1);
      link.favoritesCount--;
      link.favorited = false;
      await this.userRepository.save(user);
      link = await this.linkRepository.save(link);
    }
    return {link};
  }

  async findComments(slug: string): Promise<CommentsRO | undefined> {
    const link = await this.linkRepository.findOne({slug}, {relations: ['author']});
    if(!link) return;
    const qb = await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where("1 = 1")
      .andWhere("comment.link.id = :id", { id: link.id })
      .orderBy('comment.published', 'DESC');
    const commentsCount = await qb.getCount();
    const comments = await qb.getMany();
    return {comments, commentsCount};
  }

  slugify(title: string) {
    return `${slug(title)}-${uuid()}`
  }  */
}
