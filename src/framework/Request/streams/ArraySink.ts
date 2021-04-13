import Promise from '@dojo/framework/shim/Promise';
import { Sink } from './WritableStream';

// Since this Sink is doing no asynchronous operations,
// use a single resolved promise for all returned promises.
let resolved = Promise.resolve();

/**
 * A WritableStream sink that collects the chunks it receives and
 * stores them into an array.  Use the chunks property to retrieve
 * the collection of chunks.
 */
export default class ArraySink<T> implements Sink<T> {

	chunks: T[];

	abort(reason: any): Promise<void> {
		return resolved;
	}

	close(): Promise<void> {
		return Promise.resolve();
	}

	start(error: (error: Error) => void): Promise<void> {
		this.chunks = [];
		return resolved;
	}

	write(chunk: T): Promise<void> {
		if (chunk) {
			this.chunks.push(chunk);
		}
		return resolved;
	}
}
