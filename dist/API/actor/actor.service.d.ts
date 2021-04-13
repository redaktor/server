import { Repository } from 'typeorm';
import ActorEntity, { CreateActorDto, ActorRO } from './actor.entity';
import SettingsEntity from './settings.entity';
import TypeEntity from '../object/type.entity';
export default class ActorService {
    private readonly actorRepository;
    private readonly settingsRepository;
    private readonly typeRepository;
    constructor(actorRepository: Repository<ActorEntity>, settingsRepository: Repository<SettingsEntity>, typeRepository: Repository<TypeEntity>);
    static createBase(objectData: CreateActorDto): void;
    create(actorData: CreateActorDto, persist?: boolean): Promise<ActorRO>;
    update(uid: number, actorData: CreateActorDto): Promise<ActorRO>;
    delete(uid: number): Promise<any>;
}
