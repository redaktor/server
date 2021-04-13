import BaseEntity, {
  Entity, Column, JoinColumn, ManyToMany, ManyToOne, OneToMany
} from '../shared/base.entity';
import { Any, array, object, string, number } from '../../framework/validator';

import TypeEntity from './type.entity';
import ObjectEntity, { CreateObjectDto } from './object.entity';
import LinkEntity, { CreateLinkDto } from '../link/link.entity';
import TagEntity from '../tag/tag.entity';
import NameEntity from './name.entity';
import SummaryEntity from './summary.entity';
import ContentEntity from './content.entity';

/*
Actor, Activity, Object, Link, Collection

Permissions (inbox/outbox)
*actor_id     (int)         :user
*activity_id  (int)         :activity
*time          (datetime but a smaller type like int would be better)



activityTypes:
  "Accept", "Add", "Announce", "Arrive", "Block", "Create", "Delete",
  "Dislike", "Flag", "Follow", "Ignore", "Invite", "Join", "Leave", "Like",
  "Listen", "Move", "Offer", "Question", "Reject", "Read", "Remove",
  "TentativeReject", "TentativeAccept", "Travel", "Undo", "Update", "View",
  "Activity"

objectTypes:
  "Article", "Audio", "Document", "Event", "Image", "Note", "Page", "Place",
  "Profile", "Relationship", "Tombstone", "Video", "Object"

actorTypes: "Application", "Group", "Organization", "Person", "Service"

linkTypes: "Mention", "Link"


Special properties Tombstone: formerType | deleted                 // (deleted object)
MAP
  createdAt -> published
  updatedAt -> updated

  title: string; -> nameMap
  description: string; -> summaryMap
  body: string; -> contentMap
  author: UserEntity; -> attributedTo
  tagList: string[]; -> tag
  comments: CommentEntity[]; -> replies
*/

/* TODO : IT IS "activity" if type = core activity type || (type !== 'Relationship' && !!x.object) */
/* TODO : normalize "language" and "units" for parsers ! */

export type LinkOrObject = string | CreateLinkDto | CreateObjectDto;

export class CreateObjectBaseDto {
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
  @Any(object.isRDFstring())
  readonly nameMap?: {[k:string]: string};
  @Any(object.isRDFstring())
  readonly summaryMap?: {[k:string]: string};
  @Any(object.isRDFstring())
  readonly contentMap?: {[k:string]: string};

  readonly tag?: LinkOrObject;
  readonly generator?: LinkOrObject;
  readonly icon?: LinkOrObject;  /* Image */
  readonly image?: LinkOrObject; /* Image */
  readonly location?: LinkOrObject;
  readonly preview?: LinkOrObject;

  readonly duration?: string; /* xsd:duration */

  readonly endTime?: string | Date; /* Date */
  readonly startTime?: string | Date; /* Date */
  readonly unknownProperties?: any;
}

@Entity('object-base')
export default class ObjectBaseEntity extends BaseEntity {
  /** Identifies the MIME media type of the link or content property */
  /* FIXME ISSUE EXISTS /w3c/activitystreams/issues/443#issuecomment-358904543 */
  @Column({ default: 'text/html' })
  @Any(string.hasValidMime())
  mediaType: string; // TODO

  /** This object was an URL. */
  @Column({ default: false })
  isURL: boolean;
  @Column({ default: false })
  isSingleObject: boolean;

  /** Unknown properties */
  @Column('simple-json', { nullable: true })
  unknownProperties: { [key: string]: string };

  /** Multiple language tagged summaries of the object encoded as HTML. */
  /* FIXME ISSUE EXISTS /w3c/activitystreams/issues/443 */
  @Any(object.isRDFstring())
  @ManyToMany(type => SummaryEntity)
  @JoinColumn()
  summaryMap: SummaryEntity[];

  /** Multiple language tagged representations of a simple, human-readable,
  * plain-text name for the object. */
  /* FIXME ISSUE EXISTS /w3c/activitystreams/issues/443 */
  @Any(object.isRDFstring())
  @ManyToMany(type => NameEntity)
  @JoinColumn()
  nameMap: NameEntity[];

  /** Body: The content representation of the Object encoded as a JSON string
  * (use mediaType, defaults to HTML). */
  //@Column('text')
  //content: string;
  /** Multilanguage content representation of the Object encoded as a JSON string
  * (mediaType, default HTML). */
  /* FIXME ISSUE EXISTS /w3c/activitystreams/issues/443 */
  @Any(object.isRDFstring())
  @ManyToMany(type => ContentEntity)
  @JoinColumn()
  contentMap: ContentEntity[];

  /** Identifies the Object or Link type. Multiple values may be specified. */ // TODO
  @ManyToOne(type => TypeEntity, { eager: true, cascade: true })
  @JoinColumn()
  type: TypeEntity;

  /** Identifies the entity (e.g. an application) that generated the object. */
  //@Column({ default: { "type": "Application", "name": "redaktor" } })
  // TODO FIXME
  @ManyToMany(type => ObjectEntity)
  @JoinColumn()
  generator: ObjectEntity;


  /** Provides the globally unique identifier for an Object or Link. */
  @ManyToMany(type => LinkEntity, { eager: true, cascade: true })
  @JoinColumn()
  id: LinkEntity;

  /** Identifies one or more links to representations of the object. */
  @ManyToMany(type => LinkEntity, { nullable: true })
  @JoinColumn()
  url: LinkEntity;


  /** Identifies the context within which the object exists or an activity was performed.
  * An example could be a relating common project or event. */
  @ManyToOne(type => ObjectEntity)
  context: ObjectEntity;

  /** Tags that have been associated with an object. Can be any kind of Object. */
  // TODO FIXME
  @Any(array.items(string.isHashtag()))
  @ManyToMany(type => TagEntity)
  tag: TagEntity[];

  // TODO rel
  /*
  {
      "type": "Image",
      "name": "Note icon",
      "url": "http://example.org/note.png",
      "width": 16,
      "height": 16
    }
  */
  /** Indicates an entity that describes an icon (ratio 1:1, small size). */
  @ManyToMany(type => ObjectEntity)
  @JoinColumn()
  icon: ObjectEntity[];
  /** Indicates an entity that describes an image for this object (any ratio/size). */
  // TODO rel
  @ManyToMany(type => ObjectEntity)
  @JoinColumn()
  image: ObjectEntity[];
  /** Indicates one or more physical or logical locations associated with the object. */
  @ManyToMany(type => ObjectEntity)
  @JoinColumn()
  location: ObjectEntity[];
  /** Identifies an entity that provides a preview of this object. */
  @ManyToMany(type => ObjectEntity)
  @JoinColumn()
  preview: ObjectEntity[];

  /** properties for type "Relation" and Linked Data */

/* TODO FIXME LdEntity
  @ManyToMany(type => LdEntity)
  @JoinColumn()
  ldProperties: any;
*/
}
