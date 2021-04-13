import { Handle } from '@dojo/framework/core/Destroyable';
import Evented from '@dojo/framework/core/Evented';
import { EventEmitter } from '../../on';
import { Source } from '../ReadableStream';
import ReadableStreamController from '../ReadableStreamController';
export declare type EventTargetTypes = Evented | EventEmitter | EventTarget;
export declare type EventTypes = string | string[];
export default class EventedStreamSource implements Source<Event> {
    protected _controller: ReadableStreamController<Event>;
    protected _target: EventTargetTypes;
    protected _events: string[];
    protected _handles: Handle[];
    constructor(target: EventTargetTypes, type: EventTypes);
    start(controller: ReadableStreamController<Event>): Promise<void>;
    cancel(reason?: any): Promise<void>;
    protected _handleEvent(event: Event): void;
}
