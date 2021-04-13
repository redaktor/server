import ObjectBaseEntity, { LinkOrObject } from './object.base.entity';
export interface ObjectRO {
    object: ObjectEntity;
}
export interface ObjectsRO {
    objects: ObjectEntity[];
    objectsCount: number;
}
export declare class CreateObjectDto {
    readonly inReplyTo?: LinkOrObject;
    readonly replies?: LinkOrObject[];
    readonly source?: string;
    readonly describes?: LinkOrObject;
    readonly accuracy?: number;
    readonly altitude?: number;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly radius?: number;
    readonly units?: string;
    readonly spoiler_text?: string;
}
export default class ObjectEntity {
    base: ObjectBaseEntity;
    attributedTo: ObjectEntity[];
    audience: ObjectEntity;
    to: string;
    cc: string;
    bto: string;
    bcc: string;
    inReplyTo: ObjectEntity;
    replies: ObjectEntity[];
    replyLevel: number;
    source: string;
    describes: ObjectEntity;
    duration: string;
    endTime: Date;
    startTime: Date;
    accuracy: number;
    altitude: number;
    latitude: number;
    longitude: number;
    radius: number;
    units: string;
    sensitive: boolean;
    visibility: number;
    spoiler_text: string;
    app_id: number;
}
