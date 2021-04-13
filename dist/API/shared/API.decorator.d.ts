import { HttpStatus } from '@nestjs/common';
import { ResponseMetadata } from '@nestjs/swagger';
declare type ResMetadata = {
    status: number;
    headers?: any;
} & ResponseMetadata;
declare type ResMeta = ResMetadata | ResMetadata[];
declare type Str = string | string[];
declare type ResIndex = {
    [responseStatus in keyof typeof HttpStatus]?: string;
};
interface APIoptions extends ResIndex {
    title?: string;
    description?: string;
    operationId?: string;
    deprecated?: boolean;
    response?: ResMeta;
    produces?: Str;
    consumes?: Str;
    tags?: Str;
}
export default function API(_options?: string | APIoptions, ...otherOptions: APIoptions[]): (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => any;
export {};
