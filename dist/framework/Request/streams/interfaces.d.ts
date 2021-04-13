export interface Strategy<T> {
    readonly size?: (chunk: T | undefined | null) => number;
    highWaterMark?: number;
}
