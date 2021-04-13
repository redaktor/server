export declare const schemaMin: {
    "type": string;
    "properties": {
        "_constructor": {
            "$ref": string;
        };
        "fetch": {
            "$ref": string;
        };
    };
    "additionalProperties": boolean;
    "definitions": {
        "constructor1": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "fetch": {
            "type": string;
            "properties": {
                "0": {
                    "title": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
    };
    "$schema": string;
};
export declare const initializers: {
    fetch: (this: any, ...args: any[]) => any[];
};
declare const _default: any;
export default _default;
