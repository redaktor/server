import { TagsRO } from './tag.entity';
import TagService from './tag.service';
export default class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    findAll(): Promise<TagsRO>;
}
