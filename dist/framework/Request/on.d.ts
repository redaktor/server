import { Handle } from '@dojo/framework/core/Destroyable';
import Evented, { CustomEventTypes, EventType } from '@dojo/framework/core/Evented';
export interface EventObject<T = EventType> {
    readonly type: T;
}
export interface EventCallback<O = EventObject<string>> {
    (event: O): void;
}
export interface EventEmitter {
    on(event: string, listener: EventCallback): EventEmitter;
    removeListener(event: string, listener: EventCallback): EventEmitter;
}
export declare function emit<M extends CustomEventTypes, T, O extends EventObject<T> = EventObject<T>, K extends keyof M = keyof M>(target: Evented<M, T, O>, event: M[K]): boolean;
export declare function emit<T, O extends EventObject<T> = EventObject<T>>(target: Evented<any, T, O>, event: O): boolean;
export declare function emit<O extends EventObject<string> = EventObject<string>>(target: EventTarget | EventEmitter, event: O): boolean;
export default function on<M extends CustomEventTypes, T, K extends keyof M = keyof M, O extends EventObject<T> = EventObject<T>>(target: Evented<M, T, O>, type: K | K[], listener: EventCallback<M[K]>): Handle;
export default function on<T, O extends EventObject<T> = EventObject<T>>(target: Evented<any, T, O>, type: T | T[], listener: EventCallback<O>): Handle;
export default function on(target: EventEmitter, type: string | string[], listener: EventCallback): Handle;
export default function on(target: EventTarget, type: string | string[], listener: EventCallback, capture?: boolean): Handle;
export declare function once<M extends CustomEventTypes, T, K extends keyof M = keyof M, O extends EventObject<T> = EventObject<T>>(target: Evented<M, T, O>, type: K | K[], listener: EventCallback<M[K]>): Handle;
export declare function once<T, O extends EventObject<T> = EventObject<T>>(target: Evented<any, T, O>, type: T | T[], listener: EventCallback<O>): Handle;
export declare function once(target: EventTarget, type: string | string[], listener: EventCallback, capture?: boolean): Handle;
export declare function once(target: EventEmitter, type: string | string[], listener: EventCallback): Handle;
export interface PausableHandle extends Handle {
    pause(): void;
    resume(): void;
}
export declare function pausable<M extends CustomEventTypes, T, K extends keyof M = keyof M, O extends EventObject<T> = EventObject<T>>(target: Evented<M, T, O>, type: K | K[], listener: EventCallback<M[K]>): PausableHandle;
export declare function pausable<T, O extends EventObject<T> = EventObject<T>>(target: Evented<any, T, O>, type: T | T[], listener: EventCallback<O>): PausableHandle;
export declare function pausable(target: EventTarget, type: string | string[], listener: EventCallback, capture?: boolean): PausableHandle;
export declare function pausable(target: EventEmitter, type: string | string[], listener: EventCallback): PausableHandle;
