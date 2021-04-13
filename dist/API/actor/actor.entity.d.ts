import UserEntity from '../user/user.entity';
import ObjectBaseEntity from '../object/object.base.entity';
import ObjectEntity from '../object/object.entity';
import ActivityEntity from '../activity/activity.entity';
import SettingsEntity from './settings.entity';
export interface ActorRO {
    actor: ActorEntity;
}
export declare class CreateActorDto {
    preferredUsername: string;
    isActor?: boolean;
    type?: string;
    user?: UserEntity;
}
export default class ActorEntity extends ObjectBaseEntity {
    uid: number;
    published: Date;
    updated: Date;
    skipUser(): void;
    user?: UserEntity;
    preferredUsername: string;
    inbox: ActivityEntity[];
    outbox: ActivityEntity[];
    following: ActorEntity[];
    followers: ActorEntity[];
    liked: ObjectEntity[];
    streams: ObjectEntity[];
    settings: SettingsEntity;
    lastFetchedAt: Date;
    pinnedActivities: ActivityEntity[];
    unknownProperties: {
        [key: string]: string;
    };
}
