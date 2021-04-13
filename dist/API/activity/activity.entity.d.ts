import ObjectBaseEntity from '../object/object.base.entity';
import TypeEntity from './type.entity';
import ActorEntity from '../actor/actor.entity';
import ObjectEntity from '../object/object.entity';
export default class ActivityEntity extends ObjectBaseEntity {
    actors: ActorEntity[];
    type: TypeEntity;
    object: ObjectEntity;
    origin: ObjectEntity[];
    target: ObjectEntity[];
    instrument: ObjectEntity[];
    result: ObjectEntity[];
    oneOf: ObjectEntity[];
    anyOf: ObjectEntity[];
    closed: ObjectEntity | Date | boolean;
    isPublic: boolean;
}
