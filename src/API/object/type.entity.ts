import { Entity, Column } from '../shared/base.entity';
import ActivityTypeEntity from '../activity/type.entity';

@Entity('type')
export default class TypeEntity extends ActivityTypeEntity {

  @Column({default: ''})
  text: string;

  @Column({default: false})
  isActor?: boolean;

}
