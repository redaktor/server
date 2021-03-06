/**
 * A general interface that can be used to renference a general index map of values of a particular type
 */
export interface Hash<T> {
	[id: string]: T;
}
/**
 * Object with string keys and string or string array values that describes a query string.
 */
export type ParamList = Hash<string | string[]>;

/**
 * Parses a query string, returning a ParamList object.
 */
function parseQueryString(input: string): ParamList {
	const query: Hash<string[]> = {};
	const splits = input.split('&');

	for (let i = 0; i < splits.length; i++) {
		const entry = splits[i];
		const indexOfFirstEquals = entry.indexOf('=');
		let key: string;
		let value = '';

		if (indexOfFirstEquals >= 0) {
			key = entry.slice(0, indexOfFirstEquals);
			value = entry.slice(indexOfFirstEquals + 1);
		} else {
			key = entry;
		}

		key = key ? decodeURIComponent(key) : '';
		value = value ? decodeURIComponent(value) : '';

		if (key in query) {
			query[key].push(value);
		} else {
			query[key] = [value];
		}
	}
	return query;
}

/**
 * Represents a set of URL query search parameters.
 */
export class UrlSearchParams {
	/**
	 * Constructs a new UrlSearchParams from a query string, an object of parameters and values, or another
	 * UrlSearchParams.
	 */
	constructor(input?: string | ParamList | UrlSearchParams) {
		let list: ParamList = {};

		if (input instanceof UrlSearchParams) {
			// Copy the incoming UrlSearchParam's internal list
			list = <ParamList>JSON.parse(JSON.stringify(input._list));
		} else if (typeof input === 'object') {
			// Copy the incoming object, assuming its property values are either arrays or strings
			list = {};
			for (const key in input) {
				const value = (<ParamList>input)[key];

				if (Array.isArray(value)) {
					list[key] = value.length ? value.slice() : [''];
				} else if (value == null) {
					list[key] = [''];
				} else {
					list[key] = [<string>value];
				}
			}
		} else if (typeof input === 'string') {
			// Parse the incoming string as a query string
			list = parseQueryString(input);
		}

		this._list = list as Hash<string[] | undefined>;
	}

	/**
	 * Maps property keys to arrays of values. The value for any property that has been set will be an array containing
	 * at least one item. Properties that have been deleted will have a value of 'undefined'.
	 */
	protected readonly _list: Hash<string[] | undefined>;

	/**
	 * Appends a new value to the set of values for a key.
	 * @param key The key to add a value for
	 * @param value The value to add
	 */
	append(key: string, value: string): void {
		if (!this.has(key)) {
			this.set(key, value);
		} else {
			const values = this._list[key];
			if (values) {
				values.push(value);
			}
		}
	}

	/**
	 * Deletes all values for a key.
	 * @param key The key whose values are to be removed
	 */
	delete(key: string): void {
		// Set to undefined rather than deleting the key, for better consistency across browsers.
		// If a deleted key is re-added, most browsers put it at the end of iteration order, but IE maintains
		// its original position.  This approach maintains the original position everywhere.
		this._list[key] = undefined;
	}

	/**
	 * Returns the first value associated with a key.
	 * @param key The key to return the first value for
	 * @return The first string value for the key
	 */
	get(key: string): string | undefined {
		if (!this.has(key)) {
			return undefined;
		}
		const value = this._list[key];
		return value ? value[0] : undefined;
	}

	/**
	 * Returns all the values associated with a key.
	 * @param key The key to return all values for
	 * @return An array of strings containing all values for the key
	 */
	getAll(key: string): string[] | undefined {
		if (!this.has(key)) {
			return undefined;
		}
		return this._list[key];
	}

	/**
	 * Returns true if a key has been set to any value, false otherwise.
	 * @param key The key to test for existence
	 * @return A boolean indicating if the key has been set
	 */
	has(key: string): boolean {
		return Array.isArray(this._list[key]);
	}

	/**
	 * Returns an array of all keys which have been set.
	 * @return An array of strings containing all keys set in the UrlSearchParams instance
	 */
	keys(): string[] {
		const keys: string[] = [];

		for (const key in this._list) {
			if (this.has(key)) {
				keys.push(key);
			}
		}

		return keys;
	}

	/**
	 * Sets the value associated with a key.
	 * @param key The key to set the value of
	 */
	set(key: string, value: string): void {
		this._list[key] = [value];
	}

	/**
	 * Returns this object's data as an encoded query string.
	 * @return A string in application/x-www-form-urlencoded format containing all of the set keys/values
	 */
	toString(): string {
		const query: string[] = [];

		for (const key in this._list) {
			if (!this.has(key)) {
				continue;
			}

			const values = this._list[key];
			if (values) {
				const encodedKey = encodeURIComponent(key);
				for (let i = 0; i < values.length; i++) {
					query.push(encodedKey + (values[i] ? '=' + encodeURIComponent(values[i]) : ''));
				}
			}
		}

		return query.join('&');
	}
}

export default UrlSearchParams;
