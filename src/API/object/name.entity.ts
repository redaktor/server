import { Entity, PrimaryGeneratedColumn, Column } from '../shared/base.entity';

@Entity('name')
export default class NameEntity {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({default: 'en'})
  language: string;

  @Column({default: ''})
  text: string;
}
