import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare const FAILED = "Input data validation failed.";
export declare class ValidationPipe implements PipeTransform<any> {
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
    private toValidate;
}
export declare function Validate(): MethodDecorator;
