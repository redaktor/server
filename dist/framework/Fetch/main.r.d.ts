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
                    "$ref": string;
                    "title": string;
                };
            };
            "additionalProperties": boolean;
        };
        "FetchProperties": {
            "type": string;
            "properties": {
                "body": {
                    "anyOf": ({
                        "$ref": string;
                        "type"?: undefined;
                    } | {
                        "type": string;
                        "$ref"?: undefined;
                    })[];
                };
                "cache": {
                    "$ref": string;
                    "default": string;
                };
                "credentials": {
                    "$ref": string;
                    "default": string;
                };
                "headers": {
                    "anyOf": ({
                        "$ref": string;
                        "type"?: undefined;
                        "items"?: undefined;
                    } | {
                        "type": string;
                        "items": {
                            "type": string;
                            "items": {
                                "type": string;
                            };
                        };
                        "$ref"?: undefined;
                    })[];
                };
                "integrity": {
                    "default": string;
                    "type": string;
                };
                "keepalive": {
                    "default": boolean;
                    "type": string;
                };
                "method": {
                    "default": string;
                    "type": string;
                };
                "mode": {
                    "$ref": string;
                    "default": string;
                };
                "redirect": {
                    "$ref": string;
                    "default": string;
                };
                "referrer": {
                    "default": string;
                    "type": string;
                };
                "referrerPolicy": {
                    "$ref": string;
                    "default": string;
                };
                "signal": {};
                "compress": {
                    "default": boolean;
                    "type": string;
                };
                "followCount": {
                    "minimum": number;
                    "default": number;
                    "type": string;
                };
                "isRobot": {
                    "default": boolean;
                    "type": string;
                };
                "timeout": {
                    "minimum": number;
                    "type": string;
                };
                "size": {
                    "minimum": number;
                    "type": string;
                };
                "priority": {
                    "minimum": number;
                    "default": number;
                    "type": string;
                };
                "preRequest": {
                    "type": string;
                    "additionalProperties": boolean;
                };
                "retryCount": {
                    "minimum": number;
                    "default": number;
                    "type": string;
                };
                "retryDelay": {
                    "minimum": number;
                    "default": number;
                    "type": string;
                };
                "server": {
                    "$ref": string;
                };
                "window": {};
            };
            "additionalProperties": boolean;
        };
        "ArrayBuffer": {
            "type": string;
            "properties": {
                "byteLength": {
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "ArrayBufferView": {
            "type": string;
            "properties": {
                "buffer": {
                    "$ref": string;
                };
                "byteLength": {
                    "type": string;
                };
                "byteOffset": {
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "Blob": {
            "type": string;
            "properties": {
                "size": {
                    "type": string;
                };
                "type": {
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "FormData": {
            "type": string;
            "additionalProperties": boolean;
        };
        "ReadableStream": {
            "type": string;
            "properties": {
                "locked": {
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "URLSearchParams": {
            "type": string;
            "additionalProperties": boolean;
        };
        "NodeJS.ReadableStream": {
            "type": string;
            "properties": {
                "readable": {
                    "type": string;
                };
            };
            "additionalProperties": boolean;
            "required": string[];
        };
        "RequestCache": {
            "enum": string[];
            "type": string;
        };
        "RequestCredentials": {
            "enum": string[];
            "type": string;
        };
        "Headers": {
            "type": string;
            "additionalProperties": boolean;
        };
        "Record<string,string>": {
            "type": string;
            "additionalProperties": boolean;
        };
        "RequestMode": {
            "enum": string[];
            "type": string;
        };
        "RequestRedirect": {
            "enum": string[];
            "type": string;
        };
        "ReferrerPolicy": {
            "enum": string[];
            "type": string;
        };
        "ServerProperties": {
            "type": string;
            "properties": {
                "agent": {};
                "skipDuplicates": {
                    "type": string;
                };
                "depthPriority": {
                    "type": string;
                };
                "customCrawl": {
                    "type": string;
                    "additionalProperties": boolean;
                };
                "onSuccess": {
                    "type": string;
                    "additionalProperties": boolean;
                };
                "onError": {
                    "type": string;
                    "additionalProperties": boolean;
                };
                "appMode": {
                    "default": boolean;
                    "type": string;
                };
                "ignoreHTTPSErrors": {
                    "default": boolean;
                    "type": string;
                };
                "ignoreDefaultArgs": {
                    "default": boolean;
                    "anyOf": ({
                        "type": string;
                        "items": {
                            "type": string;
                        };
                    } | {
                        "type": string;
                        "items"?: undefined;
                    })[];
                };
                "headless": {
                    "default": boolean;
                    "type": string;
                };
                "executablePath": {
                    "type": string;
                };
                "slowMo": {
                    "type": string;
                };
                "defaultViewport": {
                    "type": string;
                    "properties": {
                        "width": {
                            "type": string;
                        };
                        "height": {
                            "type": string;
                        };
                        "deviceScaleFactor": {
                            "default": number;
                            "type": string;
                        };
                        "isMobile": {
                            "default": boolean;
                            "type": string;
                        };
                        "hasTouch": {
                            "default": boolean;
                            "type": string;
                        };
                        "isLandscape": {
                            "default": boolean;
                            "type": string;
                        };
                    };
                    "additionalProperties": boolean;
                };
                "args": {
                    "type": string;
                    "items": {
                        "type": string;
                    };
                };
                "handleSIGINT": {
                    "default": boolean;
                    "type": string;
                };
                "handleSIGTERM": {
                    "default": boolean;
                    "type": string;
                };
                "handleSIGHUP": {
                    "default": boolean;
                    "type": string;
                };
                "timeout": {
                    "default": string;
                    "type": string;
                };
                "dumpio": {
                    "default": boolean;
                    "type": string;
                };
                "userDataDir": {
                    "type": string;
                };
                "env": {
                    "default": string;
                    "type": string;
                    "additionalProperties": {
                        "type": string[];
                    };
                };
                "devtools": {
                    "type": string;
                };
                "pipe": {
                    "default": boolean;
                    "type": string;
                };
            };
            "additionalProperties": boolean;
        };
        "fetch": {
            "type": string;
            "properties": {
                "0": {
                    "format": string;
                    "title": string;
                    "type": string;
                };
                "1": {
                    "$ref": string;
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
    clientFetch: (this: any, ...args: any[]) => {}[];
};
declare const _default: any;
export default _default;
