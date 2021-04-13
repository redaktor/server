import has from '@dojo/framework/has/has';
import { Handle } from '@dojo/framework/core/Destroyable';
import Task from '../async/Task';
import { createHandle, generateRequestUrl } from '../util';
import { RequestOptions, Response, ResponsePromise } from '../request';
import RequestTimeoutError from './errors/RequestTimeoutError';

export function getStringFromFormData(formData: any): string {
	const fields: string[] = [];

	for (const key of formData.keys()) {
		fields.push(encodeURIComponent(key) + '=' + encodeURIComponent(formData.get(key)));
	}

	return fields.join('&');
}
/**
 * Wraps a setTimeout call in a handle, allowing the timeout to be cleared by calling destroy.
 *
 * @param callback Callback to be called when the timeout elapses
 * @param delay Number of milliseconds to wait before calling the callback
 * @return Handle which can be destroyed to clear the timeout
 */
export function createTimer(callback: (...args: any[]) => void, delay?: number): Handle {
	let timerId: number | null = setTimeout(callback, delay);

	return createHandle(function() {
		if (timerId) {
			clearTimeout(timerId);
			timerId = null;
		}
	});
}

export interface XhrRequestOptions extends RequestOptions {
	blockMainThread?: boolean;
}

/**
 * A lookup table for valid `XMLHttpRequest#responseType` values.
 *
 * 'json' deliberately excluded since it is not supported in all environments, and as there is
 * already a filter for it in '../request'. Default '' and 'text' values also deliberately excluded.
 */
const responseTypeMap: { [key: string]: string; } = {
	arraybuffer: 'arraybuffer',
	// XHR2 environments that do not support `responseType=blob` still support `responseType=arraybuffer`,
	// which is a better way of handling blob data than as a string representation.
	blob: /*has('xhr2-blob') ? 'blob' :*/ 'arraybuffer',
	document: 'document'
};

/* a noop handle for cancelled requests */
const noop = function() { };

/**
 * Converts a string to an array buffer
 * @param str The string to convert
 */
function stringToArrayBuffer(str: string): ArrayBuffer {
	const buf = new ArrayBuffer(str.length * 2);
	const bufView = new Uint8Array(buf);
	for (let i = 0; i < str.length; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
};

export default function xhr<T>(url: string, options: XhrRequestOptions = {}): ResponsePromise<T> {
	const request = new XMLHttpRequest();
	const requestUrl = generateRequestUrl(url, options);
	const response: Response<T> = {
		data: null,
		nativeResponse: request,
		requestOptions: options,
		statusCode: null,
		statusText: null,
		url: requestUrl,

		getHeader(name: string): null | string {
			return request.getResponseHeader(name);
		}
	};
	let isAborted = false;

	function abort() {
		isAborted = true;
		if (request) {
			request.abort();
			request.onreadystatechange = noop;
		}
	}

	const promise = new Task<Response<T>>(function (resolve, reject): void {
		if (!options.method) {
			options.method = 'GET';
		}

		if ((!options.user || !options.password) && options.auth) {
			let auth = options.auth.split(':');
			options.user = decodeURIComponent(auth[0]);
			options.password = decodeURIComponent(auth[1]);
		}

		request.open(options.method, requestUrl, !options.blockMainThread, options.user, options.password);

		if (has('xhr2') && options.responseType && options.responseType in responseTypeMap) {
			request.responseType = responseTypeMap[options.responseType];
		}

		let timeoutHandle: Handle;
		request.onreadystatechange = function (): void {
			if (!isAborted && request.readyState === 4) {
				request.onreadystatechange = noop;
				timeoutHandle && timeoutHandle.destroy();

				if (options.responseType === 'xml') {
					response.data = request.responseXML;
				}
				else {
					response.data = ('response' in request) ? request.response : request.responseText;
					/* Android 4 has a defect where it doesn't respect the responseType
					 * See https://github.com/dojo/core/issues/125 */
					if (options.responseType === 'arraybuffer' && typeof response.data === 'string' && has('arraybuffer')) {
						response.data = <any> stringToArrayBuffer((<any> response).data);
					}
				}

				response.statusCode = request.status;
				response.statusText = request.statusText;
				if (response.statusCode > 0 && response.statusCode < 400) {
					resolve(response);
				}
				else {
					reject(response.statusText ?
						new Error(response.statusText) :
						new Error('An error prevented completion of the request.')
					);
				}
			}
		};

		if (options.timeout > 0 && options.timeout !== Infinity) {
			timeoutHandle = createTimer(function () {
				// Reject first, since aborting will also fire onreadystatechange which would reject with a
				// less specific error.  (This is also why we set up our own timeout rather than using
				// native timeout and ontimeout, because that aborts and fires onreadystatechange before ontimeout.)
				reject(new RequestTimeoutError('The XMLHttpRequest request timed out.'));
				abort();
			}, options.timeout);
		}

		const headers = options.headers;
		let hasContentTypeHeader = false;
		let hasRequestedWithHeader = false;
		if (headers) {
			for (let header in headers) {
				if (header.toLowerCase() === 'content-type') {
					hasContentTypeHeader = true;
				} else if (header.toLowerCase() === 'x-requested-with') {
					hasRequestedWithHeader = true;
				}
				request.setRequestHeader(header, headers[header]);
			}
		}

		if (!hasRequestedWithHeader) {
			request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		}

		if (!hasContentTypeHeader && has('formdata') && options.data instanceof (<any>global||window).FormData) {
			// Assume that most forms do not contain large binary files. If that is not the case,
			// then "multipart/form-data" should be manually specified as the "Content-Type" header.
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}

		if (options.responseType === 'xml' && request.overrideMimeType) {
			// This forces the XHR to parse the response as XML regardless of the MIME-type returned by the server
			request.overrideMimeType('text/xml');
		}

		request.send(options.data);
	}, function () {
		abort();
	});

	return promise;
}
