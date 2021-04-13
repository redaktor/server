import * as AJV from 'ajv';
interface ErrorObject extends AJV.ErrorObject {
    parentSchema?: {
        [key: string]: any;
    } | undefined;
}
export declare function Validator(errorFn?: (errors: ErrorObject[]) => ErrorObject[] | void): (target: any, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const Validate: (target: any, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function validateMeta(metatype: any, value: any): {
    valid: boolean | PromiseLike<any>;
    errors: {
        name: string;
        text: string;
        parentSchema?: {
            [key: string]: any;
        };
        keyword: string;
        dataPath: string;
        schemaPath: string;
        params: AJV.ErrorParameters;
        propertyName?: string;
        message?: string;
        schema?: any;
        data?: any;
    }[];
};
export {};
