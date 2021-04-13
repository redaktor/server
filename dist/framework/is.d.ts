declare type TOF = 'undefined' | 'null' | 'NaN' | 'number' | 'integer' | 'string' | 'boolean' | 'symbol' | 'function' | 'object' | 'array';
export default function is(data: any, evtType?: TOF): any;
export {};
