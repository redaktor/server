"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const url_entity_1 = require("./url.entity");
const block_entity_1 = require("./block.entity");
const host_entity_1 = require("./host.entity");
const path_entity_1 = require("./path.entity");
const query_entity_1 = require("./query.entity");
const hash_entity_1 = require("./hash.entity");
function pick(obj, paths) {
    return Object.assign({}, paths.reduce((mem, key) => (Object.assign(Object.assign({}, mem), { [key]: obj[key] })), {}));
}
let UrlService = class UrlService {
    constructor(urlRepository, blockRepository, hostRepository, pathRepository, queryRepository, hashRepository) {
        this.urlRepository = urlRepository;
        this.blockRepository = blockRepository;
        this.hostRepository = hostRepository;
        this.pathRepository = pathRepository;
        this.queryRepository = queryRepository;
        this.hashRepository = hashRepository;
    }
    async blockedParents(urlData) {
        const pathArr = urlData.path.split('/');
        return !pathArr.length ? [] : await this.urlRepository.createQueryBuilder('url')
            .innerJoin('url.host', 'host')
            .innerJoinAndSelect('url.path', 'path')
            .leftJoinAndSelect('url.block', 'block')
            .where('host.host = :host', { host: urlData.host })
            .andWhere('block.recursive = :rblock', { rblock: true })
            .andWhere(new typeorm_2.Brackets(qb => {
            qb.where('path.path = :path', { path: pathArr[0] })
                .orWhere('path.path LIKE :lpath', { lpath: `${pathArr[0]}/%` });
        }))
            .getMany();
    }
    async create(urlString) {
        const urlData = this.input(urlString);
        const urlRelations = {};
        const keys = ['host', 'path', 'query', 'hash', 'auth'];
        let blockedPaths = [];
        await Promise.all(keys.map(async (k) => {
            if (!!urlData[k]) {
                const def = { [k]: urlData[k] };
                urlRelations[k] = await this[`${k}Repository`].findOne(def);
                if (!urlRelations[k]) {
                    urlRelations[k] = this[`${k}Repository`].create(def);
                    await this[`${k}Repository`].save(urlRelations[k]);
                }
                if (k === 'path' && !!urlData.path) {
                    blockedPaths = await this.blockedParents(urlData);
                }
            }
            return k;
        }));
        console.log('blockedPaths0', blockedPaths);
        const blockProps = ['media', 'reports', 'content'];
        blockedPaths = Object.assign({}, ...blockedPaths.map(o => (!!o.block ? { path: o.path, block: o.block } : {})).reverse(), !!urlRelations.host.block ? { path: null, block: urlRelations.host.block } : {});
        console.log('blockedPaths', blockedPaths);
        let href = this.urlRepository.create(Object.assign(Object.assign(Object.assign({}, urlData), urlRelations), { recursive_block: true }));
        href = await this.urlRepository.save(href);
        return { href };
    }
    async pathStatus(blockDto) {
        const block = new block_entity_1.default();
        block.silence = !!blockDto.silence ? blockDto.silence : false;
        block.content = !!blockDto.content ? blockDto.content : false;
        block.media = !!blockDto.content ? true : (!!blockDto.media ? blockDto.media : false);
        block.reports = !!blockDto.content ? true : (!!blockDto.reports ? blockDto.reports : false);
        block.recursive = !!blockDto.recursive ? blockDto.recursive : false;
        await this.blockRepository.save(block);
        await this.urlRepository.createQueryBuilder('url')
            .relation(url_entity_1.default, "block")
            .of(blockDto.href)
            .set(block);
        return block;
    }
    async findAll(query = {}) {
        if (!query.order) {
            query.order = { uid: 'DESC' };
        }
        let _urls = await this.urlRepository.find(query);
        console.log(_urls);
        return { urls: _urls.map(this.output) };
    }
    async deleteEmptyRelations(from, keys, condition = {}) {
        if (typeof keys === 'string') {
            keys = [keys];
        }
        return await Promise.all(keys.map(async (k) => {
            if (!!from[k]) {
                let count = await this.urlRepository.count({ [k]: Object.assign(Object.assign({}, from[k]), condition) });
                if (count === 0) {
                    await this[`${k}Repository`].remove(from[k]);
                }
            }
            return k;
        }));
    }
    async delete(id) {
        const toDelete = await this.urlRepository.findOne(id);
        if (!!toDelete) {
            const deleted = await this.urlRepository.remove(toDelete);
            await this.deleteEmptyRelations(toDelete, ['path', 'query', 'hash']);
            await this.deleteEmptyRelations(toDelete, 'host', { is_suspended: false });
            return deleted;
        }
    }
    input(urlString) {
        if (typeof urlString === 'string') {
            try {
                const u = new URL(urlString);
                if (!u.path && !!u.pathname) {
                    u.path = u.pathname.replace(/^\//, '').replace(/\/$/, '');
                }
                if (!u.query && !!u.search) {
                    u.query = u.search.replace(/^[?]/, '');
                }
                if (!!u.hash) {
                    Object.defineProperty(u, 'hash', { value: u.hash.replace(/^[#]/, '') });
                }
                if (!!u.username) {
                    u.auth = `${u.username}${!!u.password ? ':' + u.password : ''}`;
                }
                return u;
            }
            catch (e) {
                throw new common_1.HttpException({
                    message: `${urlString} is not a valid URL`
                }, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        return urlString;
    }
    output(url) {
        return {
            url: `${url.protocol}://${url.auth ? url.auth.auth + '@' : ''}${url.host.host}` +
                `${url.port ? ':' + url.port : ''}${url.path ? '/' + url.path.path : ''}` +
                `${url.query ? '?' + url.query.query : ''}${url.hash ? '#' + url.hash.hash : ''}`
        };
    }
    async test() {
        const u1 = await this.create('https://sebastianlasse.de/test?a=b#1');
        await this.pathStatus({ href: u1.href, content: true, recursive: true });
        await this.create('https://sebastianlasse.de/test/path2?a=b#1');
        await this.create('https://sebastianlasse.de/test/path2/path3?a=b#1');
        await this.delete(1);
        return await this.findAll();
    }
};
UrlService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(url_entity_1.default)),
    tslib_1.__param(1, typeorm_1.InjectRepository(block_entity_1.default)),
    tslib_1.__param(2, typeorm_1.InjectRepository(host_entity_1.default)),
    tslib_1.__param(3, typeorm_1.InjectRepository(path_entity_1.default)),
    tslib_1.__param(4, typeorm_1.InjectRepository(query_entity_1.default)),
    tslib_1.__param(5, typeorm_1.InjectRepository(hash_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UrlService);
exports.default = UrlService;
//# sourceMappingURL=link.service Kopie.js.map