/// <reference types="node" />
export declare const byteLength: (b64: string) => number;
export declare const toUint8Array: (b64: string) => Uint8Array;
export declare const fromUint8Array: (buf: Uint8Array) => string;
export declare function escape(str: string): string;
export declare function unescape(str: string): string;
export declare function encode(str: string): string;
export declare function decode(b64String: string | Buffer): string;
export declare function urlEncode(str: string): string;
export declare function urlDecode(b64String: string | Buffer): string;
