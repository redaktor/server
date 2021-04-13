// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: redaktor
// Definitions by: Sebastian Lasse <[~AN URL FOR YOU~]>
import * as Puppeteer from 'Puppeteer';

/**
* The URL for the request
* @format url
*/
export type Url = string;

export interface ServerProperties extends Puppeteer.LaunchOptions {
  /* http(s).Agent instance, for custom proxy, certificate, dns lookup etc. */
  agent?: any;
  /* Whether to skip duplicate requests, default to true. Request is considered
  to match if url, userAgent, device & extraHeaders are strictly the same. */
  skipDuplicates?: boolean;
  /* Whether to adjust priority based on its depth, defaults to true.
  Leave default to increase priority for higher depth (depth-first search). */
  depthPriority?: boolean;
  /* Function to customize crawled result, allowing access to Puppeteer's raw API. */
  customCrawl?: (page: /*TODO Puppeteer.Page*/any, crawl: Function) => any;
  /* Function to be called when evaluatePage() successes. */
  onSuccess?: (result: FetchResponse) => void;
  /* Function to be called when request fails. */
  onError?: (error: Error) => void;
}
export interface FetchPropertiesOnly extends FetchProperties{
  url: string;
}

export interface FetchProperties extends RequestInit {
  /* These properties are part of the Fetch Standard */
  /**
  * A simple getter used to expose a ReadableStream of the body contents.
  * Can be null, a string, a Buffer, a Blob or a Node.js Readable stream
  */
  body?: BodyInit | ReadableStream | null;
  /**
  * The cache mode of the request
  * @default default
  */
  cache?: RequestCache;
  /**
  * Credentials of the request
  * @default same-origin
  */
  credentials?: RequestCredentials;
  /**
  * Request Headers. Properties from Headers constructor
  */
  headers?: HeadersInit;
  /**
  * The subresource integrity value of the request
  * @default
  */
  integrity?: string;
  /**
  * Persistent connection
  * @default false
  */
  keepalive?: boolean;
  /**
  * The request's method (GET, POST, HEAD, etc.)
  * @default GET
  */
  method?: string;
  /**
  * Mode of the request (e.g., cors, no-cors, same-origin, navigate.)
  * NOTE: no effect when used with NodeJS
  * @default cors
  */
  mode?: RequestMode;
  /**
  * Set to `manual` to extract redirect headers, `error` to reject redirect.
  * @default follow
  */
  redirect?: RequestRedirect;
  /**
  * The referrer of the request (e.g., client)
  * @default about:client
  */
  referrer?: string;
  /**
  * The referrer policy of the request (e.g., no-referrer)
  * @default
  */
  referrerPolicy?: ReferrerPolicy;
  /**
  * Pass an instance of AbortSignal to optionally abort requests
  */
  signal?: any; /* TODO */ /*AbortSignal | null;*/

/* The following properties are fetch extensions */

  /**
  * Support gzip/deflate content encoding.
  * @default true
  */
  compress?: boolean;
  /**
  * Maximum redirect count. 0 to not follow redirect. Default is 12
  * @minimum 0
  * @default 12
  * @TJS-type integer
  */
  followCount?: number;
  /**
  * Respect robots.txt and Robot Meta Tags.
  * @default false
  */
  isRobot?: boolean;
  /**
  * req/res timeout in ms, it resets on redirect. 0 to disable.
  * Signal is recommended instead. Default uses Signal.
  * @minimum 0
  * @TJS-type integer
  */
  timeout?: number;
  /**
  * Maximum response body size in bytes. 0 to disable.
  * @minimum 0
  */
  size?: number;
  /**
  * Priority of queues, defaults to 1. Any larger number is preferred then.
  * @minimum 0
  * @default 1
  */
  priority?: number;
  /* Function to do anything like modifying options before each request.
  You can also return false if you want to skip the request. */
  preRequest?: (options: FetchProperties) => any;
  /**
  * Number of limit when retry fails
  * @minimum 1
  * @default 3
  */
  retryCount?: number;
  /**
  * Number of milliseconds after each retry fails
  * @minimum 1
  * @default 10000
  */
  retryDelay?: number;
  /**
  * NodeJS only options !
  */
  server?: ServerProperties;
}

export interface FetchResponse extends Response {

}
