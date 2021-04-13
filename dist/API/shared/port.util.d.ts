export default function findFreePorts(start: number, end?: number, count?: number, ip?: string): Promise<number[]>;
export declare function scanPort(port: number | string, ip?: string): Promise<unknown>;
export declare let CURRENT_PORT: number;
export declare const PORTS: any;
export declare function getPort(): Promise<number>;
export declare function getFriendsPort(): Promise<any>;
