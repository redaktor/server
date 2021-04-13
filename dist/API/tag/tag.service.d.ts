import { Repository } from 'typeorm';
import TagEntity, { TagsRO } from './tag.entity';
export default class TagService {
    private readonly tagRepository;
    constructor(tagRepository: Repository<TagEntity>);
    findAll(): Promise<TagsRO>;
}
