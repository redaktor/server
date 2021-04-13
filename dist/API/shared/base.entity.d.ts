import { BaseEntity as Base } from 'typeorm';
export * from "typeorm";
export declare const coreTypes: string[];
export default abstract class BaseEntity extends Base {
    uid: number;
    published: Date;
    updated: Date;
}
