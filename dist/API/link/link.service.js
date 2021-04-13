"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const link_entity_1 = require("./link.entity");
const block_entity_1 = require("./block.entity");
const host_entity_1 = require("./host.entity");
const auth_entity_1 = require("./auth.entity");
const path_entity_1 = require("./path.entity");
const query_entity_1 = require("./query.entity");
const hash_entity_1 = require("./hash.entity");
let LinkService = class LinkService {
    constructor(linkRepository, blockRepository, hostRepository, authRepository, pathRepository, queryRepository, hashRepository) {
        this.linkRepository = linkRepository;
        this.blockRepository = blockRepository;
        this.hostRepository = hostRepository;
        this.authRepository = authRepository;
        this.pathRepository = pathRepository;
        this.queryRepository = queryRepository;
        this.hashRepository = hashRepository;
        this.joins = ['host', 'auth', 'path', 'hash', 'query', 'preview'];
        this.props = ['protocol', 'port', 'rel', 'height', 'width', 'hreflang', 'mediaType'];
    }
    async create(linkOrUrlString, persist = true) {
        const linkData = Object.assign({
            protocol: 'https', port: null,
            height: null, width: null, hreflang: null, mediaType: 'text/html',
        }, this.input(linkOrUrlString));
        const linkRelations = {};
        let blockedParents = [];
        await Promise.all(this.joins.map(async (k) => {
            if (!!linkData[k]) {
                const def = { text: linkData[k] };
                linkRelations[k] = await this[`${k}Repository`].findOne(def);
                if (!linkRelations[k]) {
                    linkRelations[k] = this[`${k}Repository`].create(def);
                    await this[`${k}Repository`].save(linkRelations[k]);
                }
                if (k === 'path' && !!linkData.path) {
                    blockedParents = await this.pathTree(linkData, true, false);
                }
            }
            return k;
        }));
        const blocked = Object.assign({}, ...blockedParents.map(o => (!!o.block ? { path: o.path, block: o.block } : {})).reverse(), !!linkRelations.host.block ? { path: null, block: linkRelations.host.block } : {});
        console.log(':check exists:!', Object.assign(Object.assign(Object.assign({}, linkData), linkRelations), (!!blocked.block ? { block: blocked.block } : {})));
        const existing = await this.findOne(Object.assign(Object.assign(Object.assign({}, linkData), linkRelations), (!!blocked.block ? { block: blocked.block } : {})));
        if (existing) {
            console.log('::1!', existing);
            return { link: existing };
        }
        let link = this.linkRepository.create(Object.assign(Object.assign(Object.assign({}, linkData), linkRelations), (!!blocked.block ? { block: blocked.block } : {})));
        if (persist) {
            link = await this.linkRepository.save(link);
        }
        return { link };
    }
    async setBlockStatus(blockDto) {
        const block = new block_entity_1.default();
        block.silence = !!blockDto.silence;
        block.content = !!blockDto.content;
        block.media = !!blockDto.media;
        block.reports = !!blockDto.reports;
        block.recursive = !!blockDto.blockHost || !!blockDto.recursive;
        block.blockHost = !!blockDto.blockHost;
        let blocks = [block];
        let blockedChildren = [];
        const current = await this.linkRepository.findOne(blockDto.link.uid, {
            relations: ['host', 'path']
        });
        const wasRecursive = !!current && !!current.block && !!current.block.recursive;
        if (!!wasRecursive && !block.recursive) {
            blockedChildren = await this.pathTree(current, true, true);
        }
        else if (!!block.recursive) {
            blockedChildren = await this.pathTree(current, true, true);
        }
        blocks = blocks.concat(blockedChildren);
        await Promise.all(blocks.map(async (b) => {
            await this.blockRepository.save(b);
            await (this.linkRepository).createQueryBuilder('link')
                .relation(link_entity_1.default, "block")
                .of(blockDto.link)
                .set(b);
        }));
        if (current && block.blockHost) {
            await (this.hostRepository).createQueryBuilder('link')
                .relation(host_entity_1.default, "block")
                .of(current.host)
                .set(block);
        }
        return blocks;
    }
    async findOne(query = {}) {
        return this.findQuery(query).getOne();
    }
    async findAll(query = {}) {
        return this.findQuery(query).getMany();
    }
    async delete(id) {
        const toDelete = await this.linkRepository.findOne(id);
        if (!!toDelete) {
            const deleted = await this.linkRepository.remove(toDelete);
            await this.deleteEmptyRelations(toDelete, ['path', 'query', 'hash', 'auth']);
            await this.deleteEmptyRelations(toDelete, 'host', { is_suspended: false });
            return deleted;
        }
    }
    findQuery(o = {}) {
        if (typeof o === 'string') {
            o = { href: o };
        }
        ;
        if (!(o instanceof link_entity_1.QueryFullLinkDto) && !!o.href) {
            o = this.input(o);
            delete o.href;
        }
        const q = o;
        const hasProp = (k) => (q.hasOwnProperty(k) && typeof q[k] !== 'undefined');
        const joined = (k) => q[k] === null ? `link.${k} is NULL` : `${k}.text = :${k}`;
        const param = (k) => q[k] === null ? `link.${k} is NULL` : `link.${k} = :${k}`;
        const qb = this.linkRepository.createQueryBuilder('link');
        this.joins.concat(['block']).forEach((k) => qb.leftJoinAndSelect(`link.${k}`, k));
        this.props.forEach((k) => hasProp(k) && qb.andWhere(param(k), q));
        this.joins.forEach((k) => hasProp(k) && qb.andWhere(joined(k), q));
        return qb.orderBy('link.published', 'DESC');
    }
    input(linkOrUrlString) {
        const linkData = typeof linkOrUrlString === 'string' ?
            { href: linkOrUrlString } : linkOrUrlString;
        let u;
        try {
            u = new URL(linkData.href);
        }
        catch (e) {
            const message = `${linkData.href} is not a valid URL`;
            throw new common_1.HttpException({ message }, common_1.HttpStatus.BAD_REQUEST);
        }
        const o = { protocol: u.protocol, host: u.host, port: u.port || null };
        o.auth = (!u.auth && !!u.username) ?
            `${u.username}${!!u.password ? ':' + u.password : ''}` : null;
        o.path = (!u.path && !!u.pathname) ?
            u.pathname.replace(/^\//, '').replace(/\/$/, '') : null;
        o.query = (!u.query && !!u.search) ? u.search.replace(/^[?]/, '') : null;
        o.hash = !!u.hash ? u.hash.replace(/^[#]/, '') : null;
        return Object.assign(Object.assign({}, linkData), o);
    }
    async pathTree(linkData, isBlocked = false, isChildren = false) {
        console.log(linkData);
        const pathArr = !!linkData.path ? linkData.path.split('/') : [];
        const lpath = !!isChildren ? `%/${pathArr[pathArr.length - 1]}` : `${pathArr[0]}/%`;
        return !pathArr.length ? Promise.resolve([]) : await this.linkRepository.createQueryBuilder('link')
            .innerJoin('link.host', 'host')
            .innerJoinAndSelect('link.path', 'path')
            .leftJoinAndSelect('link.block', 'block')
            .where('host.text = :host', { host: linkData.host })
            .andWhere(isBlocked === null ? '1 = 1' : 'block.recursive = :rblock', { rblock: isBlocked })
            .andWhere((isChildren ? 'path.text LIKE :lpath' : new typeorm_2.Brackets(qb => {
            qb.where('path.text = :path', { path: pathArr[0] })
                .orWhere('path.text LIKE :lpath', { lpath });
        })), { lpath }).getMany();
    }
    async deleteEmptyRelations(from, keys, condition = {}) {
        if (typeof keys === 'string') {
            keys = [keys];
        }
        return await Promise.all(keys.map(async (k) => {
            if (!!from[k]) {
                let count = await this.linkRepository.count({ [k]: Object.assign(Object.assign({}, from[k]), condition) });
                if (count === 0) {
                    await this[`${k}Repository`].remove(from[k]);
                }
            }
            return k;
        }));
    }
    async test() {
        const u3 = await this.create('https://example.com/test');
        await this.setBlockStatus(Object.assign(Object.assign({}, u3), { content: true, recursive: true, blockHost: true }));
        await this.create({
            href: 'https://example.com/test/path2',
            rel: 'me'
        });
        await this.create({ href: 'https://example.com/test/path2', rel: 'me' });
        console.log('finding');
        const found = await this.findOne('https://example.com/test/path2');
        console.log('found', found);
        const s = await this.findAll({ host: 'example.com' });
        console.log('found2', s);
        return await this.findAll();
    }
};
LinkService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(link_entity_1.default)),
    tslib_1.__param(1, typeorm_1.InjectRepository(block_entity_1.default)),
    tslib_1.__param(2, typeorm_1.InjectRepository(host_entity_1.default)),
    tslib_1.__param(3, typeorm_1.InjectRepository(auth_entity_1.default)),
    tslib_1.__param(4, typeorm_1.InjectRepository(path_entity_1.default)),
    tslib_1.__param(5, typeorm_1.InjectRepository(query_entity_1.default)),
    tslib_1.__param(6, typeorm_1.InjectRepository(hash_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LinkService);
exports.default = LinkService;
//# sourceMappingURL=link.service.js.map