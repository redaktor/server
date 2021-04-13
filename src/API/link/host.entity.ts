import { PrimaryGeneratedColumn, Column, Index, Entity, ManyToOne } from "typeorm";
import BlockEntity from "./block.entity";
/*
export class CreateHostDto {
  host: string;
}
*/
@Entity('host')
export default class HostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index({ unique: true })
  text: string;

  @ManyToOne(type => BlockEntity, { eager: true, cascade: true })
  block: BlockEntity;
}
