import {
  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  BaseEntity as Base
} from 'typeorm';

export * from "typeorm";

export const coreTypes = [ 'Link', 'Mention', 
  'Application', 'Group', 'Organization', 'Person', 'Service',
  'Article', 'Audio', 'Document', 'Event', 'Image', 'Note', 'Page', 'Place',
  'Profile', 'Relationship', 'Tombstone', 'Video',
  'Accept', 'Add', 'Announce', 'Arrive', 'Block', 'Create', 'Delete', 'Dislike',
  'Flag', 'Follow', 'Ignore', 'Invite', 'Join', 'Leave', 'Like', 'Listen', 'Move',
  'Offer', 'Question', 'Reject', 'Read', 'Remove', 'TentativeReject', 'TentativeAccept',
  'Travel', 'Undo', 'Update', 'View' ];

export default abstract class BaseEntity extends Base {
  /** The object's unique global identifier (optional in transient objects). */
  @PrimaryGeneratedColumn()
  uid: number;
  /** The date and time at which the object was published. */
  @CreateDateColumn()
  published: Date;
  /** The date and time at which the object was updated lastly. */
  @UpdateDateColumn()
  updated: Date;
}
