import { Entity, PrimaryGeneratedColumn, Column } from '../shared/base.entity';

@Entity('content')
export default class ContentEntity {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({default: 'en'})
  language: string;

  @Column('text', {default: ''})
  text: string;

}
