export default class SizeQueue<T> {
    get totalSize(): number;
    get length(): number;
    private _queue;
    empty(): void;
    enqueue(value: T | undefined, size: number): void;
    dequeue(): T | null | undefined;
    peek(): T | null | undefined;
}
