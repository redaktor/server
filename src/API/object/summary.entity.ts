import { Entity, PrimaryGeneratedColumn, Column } from '../shared/base.entity';

@Entity('summary')
export default class SummaryEntity {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({default: 'en'})
  language: string;

  @Column('text', {default: ''})
  text: string;
}
