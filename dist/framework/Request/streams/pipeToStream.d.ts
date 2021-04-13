import WritableStream from './WritableStream';
export default function pipeToStream<T>(response: any, stream: WritableStream<T>): Promise<WritableStream<T>>;
