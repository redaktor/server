import { CreateObjectDto, ObjectRO, ObjectsRO } from './object.entity';
import ObjectService from './object.service';
export default class ObjectController {
    private readonly objectService;
    constructor(objectService: ObjectService);
    findAll(query: any): Promise<ObjectsRO>;
    getFeed(userId: number, query: any): Promise<ObjectsRO>;
    findOne(slug: any): Promise<ObjectRO | undefined>;
    create(userId: number, objectData: CreateObjectDto): Promise<any>;
    update(userId: number, params: any, objectData: CreateObjectDto): Promise<ObjectRO>;
    delete(userId: number, params: any): Promise<any>;
    favorite(userId: number, slug: any): Promise<ObjectRO>;
    unFavorite(userId: number, slug: any): Promise<ObjectRO>;
}
