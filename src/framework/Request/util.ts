import { Handle } from '@dojo/framework/core/Destroyable';
import { RequestOptions } from './request';
import UrlSearchParams from './UrlSearchParams';
/**
 * Returns an object with a destroy method that, when called, calls the passed-in destructor.
 * This is intended to provide a unified interface for creating "remove" / "destroy" handlers for
 * event listeners, timers, etc.
 *
 * @param destructor A function that will be called when the handle's `destroy` method is invoked
 * @return The handle object
 */
export function createHandle(destructor: () => void): Handle {
	let called = false;
	return {
		destroy: function(this: Handle) {
			if (!called) {
				called = true;
				destructor();
			}
		}
	};
}
/**
 * Returns a single handle that can be used to destroy multiple handles simultaneously.
 *
 * @param handles An array of handles with `destroy` methods
 * @return The handle object
 */
export function createCompositeHandle(...handles: Handle[]): Handle {
	return createHandle(function() {
		for (let i = 0; i < handles.length; i++) {
			handles[i].destroy();
		}
	});
}
/**
 * Returns a URL formatted with optional query string and cache-busting segments.
 *
 * @param url The base URL.
 * @param options The RequestOptions used to generate the query string or cacheBust.
 */
export function generateRequestUrl(url: string, options: RequestOptions = {}): string {
	let query = new UrlSearchParams(options.query).toString();
	if (options.cacheBust) {
		const bustString = String(Date.now());
		query += query ? `&${bustString}` : bustString;
	}
	const separator = url.indexOf('?') > -1 ? '&' : '?';
	return query ? `${url}${separator}${query}` : url;
}

export function getStringFromFormData(formData: any): string {
	const fields: string[] = [];

	for (const key of formData.keys()) {
		fields.push(encodeURIComponent(key) + '=' + encodeURIComponent(formData.get(key)));
	}

	return fields.join('&');
}
