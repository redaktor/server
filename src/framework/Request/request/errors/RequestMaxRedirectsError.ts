import { RequestError, Response } from '../../request';

export default class RequestMaxRedirectsError<T> implements RequestError<T> {
	message: string;
	get name(): string {
		return 'RequestMaxRedirectsError';
	}

	response: Response<T>;

	constructor(message?: string) {
		this.message = message || 'The request created too many redirects.';
	}
}
