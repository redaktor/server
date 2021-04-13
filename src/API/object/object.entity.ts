import {
  Entity, Column, JoinColumn, Tree, TreeChildren, TreeParent, TreeLevelColumn,
  OneToOne, ManyToOne, ManyToMany
} from '../shared/base.entity';
import { Any, number } from '../../framework/validator';
import ObjectBaseEntity, { LinkOrObject } from './object.base.entity';

export interface ObjectRO {
  object: ObjectEntity;
}
export interface ObjectsRO {
  objects: ObjectEntity[];
  objectsCount: number;
}

export class CreateObjectDto /*extends CreateObjectBaseDto */{
  readonly inReplyTo?: LinkOrObject;
  readonly replies?: LinkOrObject[];
  readonly source?: string; // RELATION TODO FIXME
  readonly describes?: LinkOrObject;
  readonly accuracy?: number;
  readonly altitude?: number;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly radius?: number;
  readonly units?: string; // TODO FIXME
  readonly spoiler_text?: string;
}


@Entity('object')
@Tree("closure-table")
export default class ObjectEntity {
  @Column(type => ObjectBaseEntity)
  base: ObjectBaseEntity;

  /** Identifies one or more entities (objects) to which this object is attributed.
  * The attributed entities which are not actors are merged with "attributedTo".
  * For instance, an object might be attributed to the completion of another activity.
  */
  //@Index()
  @ManyToMany(type => ObjectEntity, { eager: true, cascade: true })
  attributedTo: ObjectEntity[];

  /** Identifies one or more entities that represent the total population
  * of entities for which the object can considered to be relevant. */
  @ManyToOne(type => ObjectEntity)
  audience: ObjectEntity;
  /*
  "audience": {
   "type": "Group",
   "name": "Circle XYZ Working Group"
 },
  @ManyToMany(type => ActorLocalEntity, actor => actor.outboxCollection)
  attributedToLocal: UserEntity[];
  @ManyToMany(type => ActorLocalEntity, actor => actor.inboxCollection)
  audienceLocal: UserEntity[];
  */

  /** Identifies an entity considered to be part of the public primary audience of an Object. */
  @Column() // RELATION
  to: string;
  /** Identifies an Object that is part of the public secondary audience of this Object. */
  @Column() // RELATION
  cc: string;
  /** Identifies an Object that is part of the private primary audience of this Object. */
  @Column({select: false}) // RELATION
  bto: string;
  /** Identifies Objects that are part of the private secondary audience of this Object. */
  @Column({select: false}) // RELATION
  bcc: string;

  /** Indicates one or more entities for which this object
  * is considered a response. */
  @TreeParent()
  inReplyTo: ObjectEntity;

  /** Identifies a Collection containing objects considered to be responses
  * to this object. */
  @TreeChildren()
  replies: ObjectEntity[];

  /** The level within a conversation */
  @TreeLevelColumn()
  replyLevel: number;

  /** Convey some sort of source from which the content markup was derived. */
  @Column('text') // RELATION TODO FIXME
  source: string;

// Profile
  @OneToOne(type => ObjectEntity, { eager: true, cascade: true })
  @JoinColumn()
  describes: ObjectEntity;

// Time based
  /** For a time-bound resource the duration property indicates the object's
  * approx. duration. */
  @Column({ length: 32 })
  duration: string; // https://www.w3.org/TR/xmlschema11-2/#duration
  /** The date and time describing the actual or expected ending time. */
  @Column()
  endTime: Date; // TODO : DateTime BUT Time allowed for video ?
  /** The date and time describing the actual or expected starting time. */
  @Column()
  startTime: Date; // TODO : DateTime BUT Time allowed for video ?

// Place
  /** Indicates the accuracy of position coordinates on Place objects.
  * Percentage value */
  @Any(number.min(0).max(100))
  @Column('float')
  accuracy: number;
  /** Indicates the altitude of a place.
  * The measurement units is indicated using the units property. */
  @Column('float')
  altitude: number;
  /** The latitude of a place */
  @Column('float')
  latitude: number;
  /** The longitude of a place */
  @Column('float')
  longitude: number;
  /** The radius from the given latitude and longitude for a Place.
  * The units is expressed by the units property. */
  @Any(number.min(0))
  @Column('float')
  radius: number;
  /** Specifies the measurement units for the radius and altitude properties
  * on a Place object. If not specified, the default is "m" for "meters". */
  @Column({default: 'm'})
  units: string; // TODO FIXME

// Relationship
  /*:
  subject       Link | Object
  object        Link | Object
  relationship  Link | Object
  */

// Collection
  /*:
  totalItems  xsd:nonNegativeInteger
  current     CollectionPage | Link
  first       CollectionPage | Link
  last        CollectionPage | Link
  + items || orderedItems
  */

// CollectionPage extends Collection
  /*:
  partOf
  next
  prev
  + startIndex IF ORDERED
*/

// META

// isActor +
// t.bigint "reblog_of_id" +

  @Column({default: false})
  sensitive: boolean;

  @Any(number.isInt())
  @Column({default: 0})
  visibility: number;    // default: 0, null: false

  @Column('text', {default: ''})
  spoiler_text: string;

  @Any(number.isInt())
  @Column('bigint')
  app_id: number;


// TODO
  /** Identifies a resource attached or related to an object that potentially
  * requires special handling. TODO FIXME
  @Column()
  attachment: any;
*/
  /*
    @Column({default: false})
    isReply: boolean;
  */



  /* TO ARTICLE
  @Column()
  slug: string;

  @Column({default: 0})
  favoritesCount: number;

  @Column({default: false})
  favorited: boolean;

  <-- */
}
