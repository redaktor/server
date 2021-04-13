import { BrowserRegister } from './interfaces';
declare type Identity = string;
declare type Password = string;
import { Server } from './';
export declare class Client extends Server {
    protected x: any;
    register(identity: Identity, P: Password, publicRsaKey: any): BrowserRegister;
}
export {};
