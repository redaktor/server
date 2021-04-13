import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class HashEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({length: 2048, nullable: true})
  text: string;
}
