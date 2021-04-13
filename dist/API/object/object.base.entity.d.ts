import BaseEntity from '../shared/base.entity';
import TypeEntity from './type.entity';
import ObjectEntity, { CreateObjectDto } from './object.entity';
import LinkEntity, { CreateLinkDto } from '../link/link.entity';
import TagEntity from '../tag/tag.entity';
import NameEntity from './name.entity';
import SummaryEntity from './summary.entity';
import ContentEntity from './content.entity';
export declare type LinkOrObject = string | CreateLinkDto | CreateObjectDto;
export declare class CreateObjectBaseDto {
    readonly id: string;
    readonly type?: string;
    readonly attributedTo?: LinkOrObject;
    readonly audience?: LinkOrObject;
    readonly to?: LinkOrObject;
    readonly cc?: LinkOrObject;
    readonly bto?: LinkOrObject;
    readonly bcc?: LinkOrObject;
    readonly context?: LinkOrObject;
    readonly mediaType?: LinkOrObject;
    readonly url?: string | CreateLinkDto;
    readonly name?: string;
    readonly summary?: string;
    readonly content?: string;
    readonly nameMap?: {
        [k: string]: string;
    };
    readonly summaryMap?: {
        [k: string]: string;
    };
    readonly contentMap?: {
        [k: string]: string;
    };
    readonly tag?: LinkOrObject;
    readonly generator?: LinkOrObject;
    readonly icon?: LinkOrObject;
    readonly image?: LinkOrObject;
    readonly location?: LinkOrObject;
    readonly preview?: LinkOrObject;
    readonly duration?: string;
    readonly endTime?: string | Date;
    readonly startTime?: string | Date;
    readonly unknownProperties?: any;
}
export default class ObjectBaseEntity extends BaseEntity {
    mediaType: string;
    isURL: boolean;
    isSingleObject: boolean;
    unknownProperties: {
        [key: string]: string;
    };
    summaryMap: SummaryEntity[];
    nameMap: NameEntity[];
    contentMap: ContentEntity[];
    type: TypeEntity;
    generator: ObjectEntity;
    id: LinkEntity;
    url: LinkEntity;
    context: ObjectEntity;
    tag: TagEntity[];
    icon: ObjectEntity[];
    image: ObjectEntity[];
    location: ObjectEntity[];
    preview: ObjectEntity[];
}
