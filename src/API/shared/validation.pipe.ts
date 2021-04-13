import {
  PipeTransform, Injectable, ArgumentMetadata, BadRequestException, ForbiddenException
} from '@nestjs/common';
import { USER_KEY } from '../../../framework/validator/constants';
import * as V from '../../../framework/validator';
//export const { All, Any, Not, One, string, number, array, boolean, optional, empty } = V;
export const FAILED = 'Input data validation failed.';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    console.log('!!!', metadata, value);
    /*
    { metatype: [Function: Object], type: 'param', data: 'mail' }
    { metatype: [Function: Number], type: 'custom', data: 'id' }
    */

    const { metatype, type, data } = metadata;
    if (!value && <any>data === USER_KEY) {
      console.log('AUTH ... ...')
      throw new ForbiddenException('Please Log In ...')
    }
    if (!metatype || !this.toValidate(type, metatype)) { return value }
    if (!value) {
      throw new BadRequestException(`No data submitted for root parameter ${data}`)
    }
    const { errors } = V.validateMeta(metatype, value);
    if (errors.length > 0) {
      throw new BadRequestException({ errors }, 'Input data validation failed');
    }
    return value;
  }

  private toValidate(type: string, metatype: any): boolean {
    if (!metatype || type === 'custom') { return false }
    const types = [String, Boolean, Number, Array, Object];
    return !!types.find((type) => metatype === type);
  }
}

export function Validate(): MethodDecorator {
  return V.Validator((errors: any) => {
    throw new BadRequestException({ errors }, FAILED)
  })
}
