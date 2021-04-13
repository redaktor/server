import BaseEntity, { Entity, Column, Index } from "../shared/base.entity";

@Entity()
export default class BlockEntity extends BaseEntity {
  @Column({ default: false })
  silence: boolean;
  @Column({ default: false })
  media: boolean;
  @Column({ default: false })
  reports: boolean;
  @Column({ default: false })
  content: boolean;
  @Column({ default: false })
  @Index()
  recursive: boolean;
  @Column({ default: false })
  blockHost: boolean;
}
