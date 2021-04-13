import { Index, Entity, Column, ManyToOne, ManyToMany } from '../shared/base.entity';
import ObjectBaseEntity from '../object/object.base.entity';
import TypeEntity from './type.entity';
import ActorEntity from '../actor/actor.entity';
import ObjectEntity from '../object/object.entity';

/*
export interface ActivityRO {
  object: ActivityEntity;
}
export interface ActivitiesRO {
  objects: ActivityEntity[];
  objectsCount: number;
}

export class CreateActivityDto {
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly tagList: string[] = [];
  readonly favorited: boolean = false;
}
*/

@Entity('activity')
export default class ActivityEntity extends ObjectBaseEntity {
/*
Activity
activity_id   (int)

actor_type    (smallint)    Organization ...
*actor_id     (int)         :user
verb          (smallint)    likes
object_type   (smallint)    Article ... || Collection || Link
object_id     (int)         :object

*time          (datetime but a smaller type like int would be better)

to, bto, cc, bcc, and audience
*/

  /** Describes one or more entities that either performed or are expected to
  * perform the activity.
  * Any single activity can have multiple actors.
  * WHO
  */
  //@Index()
  @ManyToMany(type => ActorEntity, actor => actor.outbox)
  actors: ActorEntity[];

  /** Describes the activity type.
  * DOES
  */
  @ManyToOne(type => TypeEntity)
  type: TypeEntity;

  /** Describes the direct object of the activity.
  * For instance, in the activity "John added a movie to his wishlist",
  * the object of the activity is the movie added.
  * WHAT
  */
  object: ObjectEntity;

  /** Describes an indirect object of the activity from which the activity is directed.
  * The precise meaning of the origin is the object of the English preposition "from".
  * For instance, in the activity "John moved an item to List B from List A",
  * the origin of the activity is "List A".
  * FROM
  */
  origin: ObjectEntity[];

  /** Describes the indirect object, or target, of the activity.
  * The precise meaning of the target is largely dependent on the type of action
  * being described but will often be the object of the English preposition "to".
  * For instance, in the activity "John added a movie to his wishlist", the target
  * of the activity is John's wishlist. An activity can have more than one target.
  * TO
  */
  target: ObjectEntity[];

  /** Identifies objects used (or to be used) in the completion of an Activity.
  * WITH
  */
  instrument: ObjectEntity[];

  /** Describes the result of the activity.
  * For instance, if a particular action results in the creation of a new resource,
  * the result property can be used to describe that new resource.
  */
  result: ObjectEntity[];

  // Question (for answers)
  /** Multiple-choice questions or "polls" are also supported using either
  * the oneOf or anyOf:
  * Identifies an exclusive option for a Question (which can have only one answer).
  */
  oneOf: ObjectEntity[];
  /** Multiple-choice questions or "polls" are also supported using
  * either the oneOf or anyOf:
  * Identifies an inclusive option for a Question (having multiple answers).
  */
  anyOf: ObjectEntity[];

  /** Indicates that a question has been closed, and answers are no longer accepted. */
  closed: ObjectEntity | Date | boolean;

  /** Identifies entities visible for everyone */
  @Column({ default: false })
  isPublic: boolean;
}
