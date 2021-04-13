import { Response } from '../../dojo/core/request';

interface SetFunc {
  (data: any, meta?: any): any;
}
export interface RequestOptions {
  url?: string;
  method?: string;
  responseType?: string;
	query?: any; /*string | ParamList;*/
	headers?: { [name: string]: string; };
	data?: any; /* post_body, NOT recommended in OAuth1 */
  meta?: any;
  set?: any;
  /* set - options, ([responseType] text, html, mf, query), result */
	timeout?: number;
  maxRedirects?: number;
  followRedirects?: boolean;
	cacheBust?: boolean;
	auth?: string;
	user?: string;
	password?: string;
}

export interface authResponse<T> extends Response {
  requestOptions: RequestOptions;
  data: any;
  nativeResponse?: any;
  statusCode?: number;
  statusMessage?: string;
  code?: string;
  error?: Error;
}

export interface authRequest extends RequestOptions {
  req?: any; /* TODO EXPRESS */
  res?: any; /* TODO EXPRESS */
  oauth?: any;
  oauth_token?: string;
  oauth_token_secret?: string;
  oauth_verifier?: string;

  access_token?: string;
  token_type?: string;
  expires_in?: string;
}
