declare type mapper = (v: any, i: number, a: any[]) => any;
export default function stringOrArray(pattern: string | string[], fn: mapper): any[];
export {};
