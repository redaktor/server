import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({type: 'text', nullable: true})
  text: string;
}
