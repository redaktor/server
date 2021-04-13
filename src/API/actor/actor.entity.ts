import {
  Entity, PrimaryGeneratedColumn, Column, JoinColumn, JoinTable,
  CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, ManyToMany,
  AfterInsert, AfterLoad
} from '../shared/base.entity';

import UserEntity from '../user/user.entity';
import ObjectBaseEntity from '../object/object.base.entity';
import ObjectEntity from '../object/object.entity';
import ActivityEntity from '../activity/activity.entity';
import SettingsEntity from './settings.entity';

export interface ActorRO {
  actor: ActorEntity;
}
export class CreateActorDto {
  preferredUsername: string;
  isActor?: boolean;
  type?: string;
  user?: UserEntity;
}
/** See https://www.w3.org/TR/activitypub/#actor-objects */
@Entity('actor')
export default class ActorEntity extends ObjectBaseEntity {
  //@Column(type => ObjectBaseEntity)
  //base?: ObjectBaseEntity;

  /** The actor's unique global identifier. */
  @PrimaryGeneratedColumn('uuid')
  uid: number;

  /** The date and time at which the actor was published. */
  @CreateDateColumn()
  published: Date;

  /** The date and time at which the actor was updated lastly. */
  @UpdateDateColumn()
  updated: Date;

  /* Local User */
  @AfterInsert()
  @AfterLoad()
  skipUser() { delete this.user }
  @ManyToOne(type => UserEntity, user => user.actors)
  user?: UserEntity;

  /** A short username (label) which may be used to refer to the actor,
  * with no uniqueness guarantees. */
  @Column()
  preferredUsername: string;


  /** An [ActivityStreams] OrderedCollection comprised of all
  * the messages received by the actor; see 5.2 Inbox.
  */
  @ManyToMany(type => ActivityEntity)
  @JoinTable()
  inbox: ActivityEntity[];
  /** An [ActivityStreams] OrderedCollection comprised of all
  * the messages produced by the actor; see 5.1 Outbox.
  */
  @ManyToMany(type => ActivityEntity)
  @JoinTable()
  outbox: ActivityEntity[];

  /** An [ActivityStreams] collection of the actors that this actor
  * is following; see 5.4 Following Collection
  */
  @ManyToMany(type => ActorEntity)
  @JoinTable()
  following: ActorEntity[];
  /** An [ActivityStreams] collection of the actors that follow
  * this actor; see 5.3 Followers Collection.
  */
  @ManyToMany(type => ActorEntity)
  @JoinTable()
  followers: ActorEntity[];
  /** An [ActivityStreams] collection of objects this actor has liked;
  * see 5.5 Liked Collection.
  */
  @ManyToMany(type => ObjectEntity)
  @JoinTable()
  liked: ObjectEntity[];
  /** A list of supplementary Collections which may be of interest. */
  @ManyToMany(type => ObjectEntity)
  streams: ObjectEntity[];




  /** The settings for this actor. */
  @OneToOne(type => SettingsEntity)
  @JoinColumn()
  settings: SettingsEntity;

  /* Meta */
  @Column()
  lastFetchedAt: Date;

  @ManyToMany(type => ActivityEntity, { eager: true })
  pinnedActivities: ActivityEntity[];

  /** Unknown properties */
  @Column('simple-json', {nullable: true})
  unknownProperties: { [key: string]: string };
}
