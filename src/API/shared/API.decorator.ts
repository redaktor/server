import { UsePipes, HttpStatus } from '@nestjs/common';
import {
  ResponseMetadata,ApiConsumes,ApiProduces,ApiUseTags,ApiResponse,ApiOperation
} from '@nestjs/swagger';
import { getMeta, setMeta } from '../../../framework/validator/shared';
import { ValidationPipe } from './validation.pipe';

type ResMetadata = {
  status: number;
  headers?: any;
} & ResponseMetadata;

type ResMeta = ResMetadata | ResMetadata[];
type Str = string | string[];
type ResIndex = {[responseStatus in keyof typeof HttpStatus]?: string}
interface APIoptions extends ResIndex {
  // ApiOperation
  title?: string;
  description?: string;
  operationId?: string;
  deprecated?: boolean;
  // ApiResponse
  response?: ResMeta;
  // ApiProduces
  produces?: Str /* mime types */;
  // ApiConsumes
  consumes?: Str /* mime types */;
  // ApiUseTags
  tags?: Str;
}

export default function API(
  _options: string /*{description}*/ | APIoptions = {},
  ...otherOptions: APIoptions[]
) {
  let options = typeof _options === 'string' ? { description: _options } : _options;
  options = otherOptions.reduce((o: APIoptions, other: APIoptions) => ({...o, ...other}), options);
  const responses = new Set();
  const response = (o: ResMetadata) => {
    responses.add(o.status);
    responses.add(`${o.status}`[0]);
    if (o.description && typeof o.description !== 'string' && o.description in HttpStatus) {
      //console.log(o, HttpStatus[o.description].replace(/_/g, ' '))
      o.description = HttpStatus[o.description].replace(/_/g, ' ')
    }
    return ApiResponse(o)
  }

  return function APIDeco(target: any, key?: string | symbol, descriptor?: PropertyDescriptor) {
    let strKey = (typeof key === 'symbol' ? key.toString() : (key || ''));
    let { title, description, operationId, deprecated } = options;
    if (title || description || operationId || typeof deprecated === 'boolean') {
      if (!descriptor && !!target.constructor) {
        if (!getMeta(target.constructor)) {
          setMeta({ title, description, operationId, deprecated }, target.constructor)
        }
      } else {
        title = title || strKey;
        ApiOperation({ title, description, operationId, deprecated });
      }
    }
    const optionsFn: any = {
      response: ApiResponse, produces: ApiProduces, consumes: ApiConsumes, tags: ApiUseTags
    }
    let k: keyof typeof options | string;
    for (k in options) {
      const v: any = options[k];
      const intK = parseInt(k, 10);
      if (!isNaN(intK) && intK in HttpStatus) {
        response({ status: intK, description: options[k] })
      } else if (k === 'response' && !!options.response) {
        Array.isArray(v) ? (v.map((r) => response(r))) : response(v)
      } else if (typeof optionsFn[k] === 'function') {
        Array.isArray(v) ? optionsFn[k](...v) : optionsFn[k](v)
      }
    }

    let has403 = !!(Reflect.getMetadata('swagger/apiBearer', target) ||
    Reflect.getMetadata('swagger/apiOauth2', target) ||
    (!!key && Reflect.getMetadata('swagger/apiBearer', target, strKey)) ||
    (!!key && Reflect.getMetadata('swagger/apiOauth2', target, strKey))) || false;

    if (!responses.has(2) && !responses.has(3)) {
      response({ status: 200, description: 'OK' })
    }
    if (has403 && !responses.has(403)) {
      response({ status: 403, description: 'Forbidden' })
    }
    if (!!descriptor) {
      return UsePipes(new ValidationPipe())(target, key, descriptor)
    }
  }
}
