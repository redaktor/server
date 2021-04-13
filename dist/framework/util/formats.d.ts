export declare const TYPES: ({
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        any: (v: any) => string;
        string?: undefined;
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        string: (s: any) => any;
        any: (v: any) => any[];
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        string: (s: any) => boolean;
        any: (v: any) => boolean;
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        string: (v: string) => any;
        any?: undefined;
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        integer: (v: number) => Date;
        number: (v: number) => Date;
        string: (v: string) => any;
        any?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        string: (s: string) => string | number;
        number: (n: number) => number;
        boolean: (b: boolean) => 0 | 1;
        date: (d: Date) => number;
        any?: undefined;
        integer?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        string: (s: any) => any;
        boolean: (b: boolean) => 0 | 1;
        date: (d: Date) => number;
        any?: undefined;
        integer?: undefined;
        number?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        array: (a: any[]) => any;
        string: (s: any) => any;
        any?: undefined;
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        symbol: (v: any) => any;
        boolean: (b: boolean) => string;
        date: (d: any) => any;
        any: (v: any) => string;
        string?: undefined;
        integer?: undefined;
        number?: undefined;
        array?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        any?: undefined;
        string?: undefined;
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
        glob?: undefined;
    };
} | {
    id: string;
    parent: string;
    is: (v: any) => boolean;
    from: {
        glob: (s: string) => RegExp;
        string: (s: string) => RegExp;
        any?: undefined;
        integer?: undefined;
        number?: undefined;
        boolean?: undefined;
        date?: undefined;
        array?: undefined;
        symbol?: undefined;
    };
})[];
export declare const TYPEMAP: any;
export declare const TYPETREE: any;
export declare const SCHEMATYPES: any;
