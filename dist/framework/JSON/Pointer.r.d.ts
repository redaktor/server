export declare const schemaMin: {
    "type": string;
    "properties": {
        "_constructor": {
            "$ref": string;
        };
        "tokens": {
            "$ref": string;
        };
        "has": {
            "$ref": string;
        };
        "get": {
            "$ref": string;
        };
        "set": {
            "$ref": string;
        };
        "remove": {
            "$ref": string;
        };
        "dict": {
            "$ref": string;
        };
        "walk": {
            "$ref": string;
        };
        "compile": {
            "$ref": string;
        };
        "escape": {
            "$ref": string;
        };
        "unescape": {
            "$ref": string;
        };
        "parse": {
            "$ref": string;
        };
    };
    "additionalProperties": boolean;
    "definitions": {
        "constructor1": {
            "type": string;
            "additionalProperties": boolean;
        };
        "tokens": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
        };
        "has": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "get": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
        };
        "set": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
                "1": {
                    "title": string;
                };
                "2": {
                    "title": string;
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "remove": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "dict": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
        };
        "walk": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
                "1": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "compile": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                    "type": string;
                    "items": {
                        "type": string;
                    };
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "escape": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "unescape": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "parse": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
    };
    "$schema": string;
};
export declare const initializers: {
    tokens: (this: any, ...args: any[]) => string[];
    has: (this: any, ...args: any[]) => any[];
    get: (this: any, ...args: any[]) => any[];
    set: (this: any, ...args: any[]) => boolean[];
    remove: (this: any, ...args: any[]) => any[];
    dict: (this: any, ...args: any[]) => any[];
    walk: (this: any, ...args: any[]) => ((value: any) => boolean)[];
    compile: (this: any, ...args: any[]) => any[];
    escape: (this: any, ...args: any[]) => any[];
    unescape: (this: any, ...args: any[]) => any[];
    parse: (this: any, ...args: any[]) => any[];
};
declare const _default: any;
export default _default;
