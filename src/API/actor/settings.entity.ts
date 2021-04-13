import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from '../shared/base.entity';
import LinkEntity from '../link/link.entity';

/** See https://www.w3.org/TR/activitypub/#actor-objects */
@Entity('settings')
export default class SettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @OneToOne(type => LinkEntity)
  bannerLink?: LinkEntity;

  // TODO ROLES
  @Column({ default: false })
  isAdmin: boolean;
  @Column({ default: false })
  isModerator: boolean;
  @Column({ default: false })
  isVerified: boolean;
  // TODO COLORS
  @Column()
  primaryColor: string;
  @Column()
  secondaryColor: string;

  // Profile
  // languages, tags, emojis

  // Relation external Profiles


  /** Settings */
  autoAcceptFollowed: boolean;
  /*
  clientSettings: any;
  settings: {
    autoWatch: boolean;
    alwaysMarkNsfw?: boolean;
  };
  */

  /** Unknown properties */
  @Column('simple-json')
  json: { [key: string]: string };
}
