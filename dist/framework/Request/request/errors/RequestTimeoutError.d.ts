import { RequestError, Response } from '../../request';
export default class RequestTimeoutError<T> implements RequestError<T> {
    message: string;
    get name(): string;
    response: Response<T>;
    constructor(message?: string);
}
