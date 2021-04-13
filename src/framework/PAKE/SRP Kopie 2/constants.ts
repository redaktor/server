import { SRP as RFC5054 } from './rfc5054groups';
export enum ACTION { R_REGISTER, R_SRP_AUTH, R_SRP_EVIDENCE, R_SRP_VERIFY, R_ID_TOKEN }
export const SRP = RFC5054;
export const HASH = { SHA256:'sha256', SHA384:'sha384', SHA512:'sha512' };
