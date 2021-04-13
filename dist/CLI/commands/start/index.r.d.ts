export declare const schemaMin: {
    "type": string;
    "properties": {
        "_constructor": {
            "$ref": string;
        };
        "run": {
            "$ref": string;
        };
    };
    "additionalProperties": boolean;
    "definitions": {
        "constructor1": {
            "type": string;
            "additionalProperties": boolean;
        };
        "run": {
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
    run: (this: any, ...args: any[]) => any[];
};
declare const _default: any;
export default _default;
