'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const main_1 = require("../../Request/main");
const main_2 = require("../../url/main");
const path = require("path");
const tv4 = require("tv4");
class Tv4async extends main_1.default {
    constructor() {
        super();
        this.schema = {};
        this.failed = {};
        if (typeof tv4.hasAsync === 'undefined') {
            tv4.hasAsync = true;
            tv4.syncValidate = tv4.validate;
            tv4.validate = (data, schema, callback, checkRecursive, banUnknown, multipleErr = true) => {
                return new Promise_1.default((resolve, reject) => {
                    var result = tv4.syncValidate(data, schema, checkRecursive, banUnknown);
                    var missingSchemas = this.tv4.missing.reduce((a, s) => {
                        if (a.indexOf(s) < 0 && !this.failed.hasOwnProperty(s)) {
                            a.push(s);
                        }
                        else if (this.failed.hasOwnProperty(s)) {
                            if (Date.now() - this.failed[s] > 30000) {
                                a.push(s);
                            }
                        }
                        return a;
                    }, []);
                    if (!missingSchemas.length) {
                        if (typeof callback != 'function') {
                            resolve(tv4.validateMultiple(data, schema, checkRecursive, banUnknown));
                        }
                        else {
                            callback(result);
                        }
                    }
                    else {
                        missingSchemas = this.tv4.missing.map((schemaUri) => {
                            const hasSchema = tv4.getSchema(schemaUri);
                            if (hasSchema) {
                                return Promise_1.default.resolve(hasSchema);
                            }
                            return this.get({ url: this._getUrl(schemaUri), responseType: 'json' }).then((fetchedSchema) => {
                                tv4.addSchema(schemaUri, fetchedSchema);
                                return fetchedSchema;
                            }, (e) => {
                                this.failed[schemaUri] = Date.now();
                                tv4.addSchema(schemaUri, {});
                                return {};
                            });
                        });
                        Promise_1.default.all(missingSchemas).then((schemas) => {
                            resolve(tv4.validate(data, schema, callback, checkRecursive, banUnknown));
                        }, (e) => {
                            reject(e);
                        });
                    }
                });
            };
        }
        this.tv4 = tv4;
    }
    _getUrl(u) {
        const _url = main_2.default.parse(u);
        if ((!(_url.host) || !_url.host.length) && _url.pathname.charAt(0) != path.sep) {
            return path.join(this.baseUrl, u);
        }
        return u;
    }
    static possibleSchemas(schema, dataPath) {
        var parts = dataPath.split('/').slice(1);
        var options = [schema];
        while (parts.length) {
            var part = parts.shift().replace(/~1/g, '/').replace(/~0/g, '~');
            var expandedOptions = [];
            while (options.length) {
                var option = options.shift();
                if (typeof option['$ref'] == 'string') {
                    option = tv4.getSchema(option['$ref']);
                }
                if (expandedOptions.indexOf(option) !== -1)
                    continue;
                if (option.allOf) {
                    options = [].concat(option.allOf).concat(options);
                }
                if (option.anyOf) {
                    options = [].concat(option.anyOf).concat(options);
                }
                if (option.oneOf) {
                    options = [].concat(option.oneOf).concat(options);
                }
                expandedOptions.push(option);
            }
            var newOptions = [];
            while (expandedOptions.length) {
                var option = expandedOptions.shift();
                if (/^(0|[1-9][0-9]*)$/.test(part)) {
                    if (Array.isArray(option.items)) {
                        if (option.items[part]) {
                            newOptions.push(option.items[part]);
                        }
                        else if (option.additionalItems) {
                            newOptions.push(option.additionalItems);
                        }
                    }
                    else if (option.items) {
                        newOptions.push(option.items);
                    }
                }
                if (option.properties && option.properties[part]) {
                    newOptions.push(option.properties[part]);
                }
                else if (option.additionalProperties) {
                    newOptions.push(option.additionalProperties);
                }
            }
            options = newOptions;
        }
        return options;
    }
}
Tv4async.errorCodes = tv4.errorCodes;
exports.default = Tv4async;
//# sourceMappingURL=Tv4async.js.map