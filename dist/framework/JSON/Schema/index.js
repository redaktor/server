'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../../../dojo/core/main");
const Promise_1 = require("@dojo/framework/shim/Promise");
const Tv4async_1 = require("./Tv4async");
const ldo_1 = require("./ldo");
const main_2 = require("../pointer/main");
const main_3 = require("../../util/main");
const path = require("path");
class Schema extends Tv4async_1.default {
    constructor(schema, language = 'en', baseUrl = undefined, fixes = {}, dereference = false, checkRecursive = true, banUnknown = false, useDefault = true) {
        super();
        this.schema = schema;
        this.language = language;
        this.baseUrl = baseUrl;
        this.fixes = fixes;
        this.dereference = dereference;
        this.checkRecursive = checkRecursive;
        this.banUnknown = banUnknown;
        this.useDefault = useDefault;
        this.isObject(schema) && schema.hasOwnProperty('schema') &&
            !('$schema' in schema) && main_1.lang.mixin(this, schema);
        if (!this.baseUrl) {
            this.baseUrl = process.cwd() || this._getCallerDir();
        }
        this.init();
    }
    init() {
        for (var code in this.fixes) {
            Schema.addFix(code, this.fixes[code]);
        }
        this.schemaUrl = this.schema;
        if (main_3.is(this.schema, 'string')) {
            try {
                this.schema = JSON.parse(this.schema);
                this.schemaUrl = this._getUrl(this.schema.id);
            }
            catch (err) { }
        }
        this.promise = new Promise_1.default((resolve, reject) => {
            const derefCB = (err, fullSchema) => {
                if (err) {
                    return reject(err);
                }
                this.schema = fullSchema;
                return resolve(fullSchema);
            };
            const returnSchema = (s) => {
                if (main_3.is(s, 'object')) {
                    this.schema = s;
                }
                if (this.dereference) {
                    try {
                        var deref = require('json-schema-deref');
                        deref(this.schema, derefCB);
                    }
                    catch (e) { }
                }
                else {
                    return resolve(this.schema);
                }
            };
            if (main_3.is(this.schema, 'object')) {
                returnSchema();
            }
            else if (main_3.is(this.schema, 'string')) {
                this.schemaUrl = this._getUrl(this.schema);
                this.baseUrl = path.dirname(this.schemaUrl);
                this.get({ url: this.schemaUrl, responseType: 'json' }).then(returnSchema, this.schemaErr('load', this.schema));
            }
        });
    }
    _getProperty(key, schema) {
        if (schema.hasOwnProperty(key)) {
            return schema[key];
        }
        else if (schema.hasOwnProperty('$ref')) {
            return this._getProperty(key, this.tv4.getSchema(schema['$ref']));
        }
        return null;
    }
    _getCallerDir() {
        var originalFunc = Error.prepareStackTrace;
        var callerfile;
        try {
            var err = new Error();
            var currentfile;
            Error.prepareStackTrace = function (err, stack) {
                return stack;
            };
            currentfile = err.stack['shift']().getFileName();
            while (err.stack.length) {
                callerfile = err.stack['shift']().getFileName();
                if (currentfile !== callerfile)
                    break;
            }
        }
        catch (e) { }
        Error.prepareStackTrace = originalFunc;
        return path.dirname(callerfile);
    }
    schemaErr(verb = 'process', url = '') {
        return (err) => {
            console.log(['Could not', verb, 'Schema:', url].join(' '), err);
        };
    }
    fromPath(schema, path) {
        var parts = path.split('/').slice(1);
        while (parts.length) {
            if (main_3.is(schema['$ref'], 'string')) {
                schema = this.tv4.getSchema(schema['$ref']);
            }
            var part = parts.shift().replace(/~1/g, '/').replace(/~0/g, '~');
            schema = schema[part];
        }
        return schema;
    }
    deref() {
        if (this.dereference === true) {
            return this.promise;
        }
        this.dereference = true;
        this.init();
        return this.promise;
    }
    getProperty(key, schemas) {
        if (typeof schemas !== 'object') {
            schemas = [this.schema];
        }
        else if (!main_3.is('array', schemas)) {
            schemas = [schemas];
        }
        for (var i = 0; i < schemas.length; i++) {
            var schema = schemas[i];
            const prop = this._getProperty(key, schema);
            if (prop !== null)
                return prop;
        }
        return null;
    }
    coerce(data, customSchema) {
        const _coerce = (schema) => {
            var seenErrors = {};
            return this.tv4.validate(data, schema).then((result) => {
                var changes = 1;
                while (changes) {
                    changes = 0;
                    result.data = data;
                    result.schema = schema;
                    for (var i = 0; i < result.errors.length; i++) {
                        var e = result.errors[i];
                        var signature = JSON.stringify([e.code, e.dataPath, e.schemaPath]);
                        if (seenErrors[signature])
                            continue;
                        changes++;
                        seenErrors[signature] = true;
                        var subData = main_2.default(data, e.dataPath);
                        var schemaValue = this.fromPath(schema, e.schemaPath);
                        var fixes = Schema.fixes[e.code] || [];
                        for (var j = 0; j < fixes.length; j++) {
                            var fixFunction = fixes[j].bind(this);
                            var fixedValue = fixFunction(subData, schemaValue, e, schema, data);
                            if (typeof fixedValue !== 'undefined') {
                                if (e.dataPath) {
                                    main_2.default(data, e.dataPath, fixedValue);
                                }
                                else {
                                    data = fixedValue;
                                }
                                break;
                            }
                        }
                    }
                }
                return this.tv4.validate(result.data, schema).then((vO) => {
                    return main_1.lang.mixin(vO, {
                        data: result.data,
                        schema: result.schema
                    });
                });
            });
        };
        return (customSchema) ? _coerce(customSchema) : this.promise.then(_coerce, this.schemaErr());
    }
    validate(data, multipleErr = true) {
        return this.promise.then((schema) => {
            return this.tv4.validate(data, schema, this.checkRecursive, this.banUnknown);
        });
    }
    validateRoute(req, res, next) {
        const trailingRegex = new RegExp('\\' + path.sep + '+$', 'g');
        const allParams = req.ldo.fromUri(req.url.replace(trailingRegex, ""));
        const body = req.body || {};
        const data = main_1.lang.mixin(allParams, body);
        if (!main_3.is(req.linkId, 'integer') || !(Object.keys(data).length)) {
            next();
            return Promise_1.default.resolve({
                errors: [],
                missing: [],
                valid: true,
                data: (data || {}),
                schema: {}
            });
        }
        const urlToLDO = [this.schemaUrl, '#/links/', req.linkId, '/schema'].join('');
        const schema = { '$ref': urlToLDO };
        const option = { params: {}, query: {}, body: {} };
        return this.coerce(data, schema).then((coerceResult) => {
            var type = '';
            for (var key in data) {
                if (typeof req.body === 'object' && req.body.hasOwnProperty(key)) {
                    type = 'body';
                }
                else {
                    type = (req.query.hasOwnProperty(key)) ? 'query' : 'params';
                }
                option[type][key] = data[key];
            }
            console.log('data', option.query);
            Object.defineProperty(req, 'params', {
                enumerable: true,
                writable: true,
                value: option.params
            });
            Object.defineProperty(req, 'query', {
                enumerable: true,
                writable: true,
                value: option.query
            });
            Object.defineProperty(req, 'body', {
                enumerable: true,
                writable: true,
                value: option.body
            });
            next();
            return req;
        }, (e) => {
            next(e);
            return e;
        });
    }
    route(router) {
        this.promise.then((schema) => {
            if (schema.links && Array.isArray(schema.links)) {
                schema.links.map(ldo_1.default.bind(router));
            }
            return schema;
        }, (err) => {
            return err;
        });
        return this;
    }
    static addFix(code, fixFunction) {
        if (Array.isArray(code)) {
            code.map((c) => {
                Schema.addFix(c, fixFunction);
            });
            return Schema;
        }
        if (typeof Schema.errorCodes[code] === 'undefined') {
            code = ['"', code, '"'].join('');
            var keys = JSON.stringify(Object.keys(Schema.errorCodes));
            main_3.log([{
                    error: ['Could not add Fix: Code', code, 'is not an Error Code.'].join(' ')
                }, { warning: 'MUST be one of:' }, { warning: keys }]);
            return Schema;
        }
        code = Schema.errorCodes[code].toString();
        Schema.fixes[code] = Schema.fixes[code] || [];
        Schema.fixes[code].push(fixFunction);
        return Schema;
    }
}
Schema.fixes = {};
const DEFAULT_FALLBACK = [
    'ENUM_MISMATCH', 'NUMBER_MULTIPLE_OF', 'NUMBER_MINIMUM', 'NUMBER_MINIMUM_EXCLUSIVE',
    'NUMBER_MAXIMUM_EXCLUSIVE', 'NUMBER_NOT_A_NUMBER',
    'STRING_LENGTH_LONG', 'STRING_LENGTH_SHORT', 'STRING_PATTERN',
    'ARRAY_LENGTH_SHORT', 'ARRAY_LENGTH_LONG', 'ARRAY_UNIQUE',
    'OBJECT_PROPERTIES_MINIMUM', 'OBJECT_PROPERTIES_MAXIMUM'
];
function truncateArray(data, p) {
    return data.slice(0, p);
}
function removeAdditional(d, p, e, s, baseData) {
    if (e.hasOwnProperty('dataPath')) {
        main_2.default(baseData).remove(e.dataPath);
    }
    return;
}
function useDefaultProperty(data, property, error, baseSchema) {
    if (!this.useDefault || !property || !baseSchema) {
        return data;
    }
    var missingPath = error.dataPath + '/' + property.replace(/~/g, '~0').replace(/\//g, '~1');
    var possibleSchemas = Schema.possibleSchemas(baseSchema, missingPath);
    data[property] = this.getProperty('default', possibleSchemas);
    return data;
}
function useDefault(data, property, error, baseSchema) {
    if (!this.useDefault || !baseSchema) {
        return data;
    }
    var missingPath = error.dataPath;
    var possibleSchemas = Schema.possibleSchemas(baseSchema, missingPath);
    data = this.getProperty('default', possibleSchemas);
    return data;
}
Schema.addFix('INVALID_TYPE', main_3.to);
Schema.addFix('STRING_LENGTH_LONG', main_3.truncate);
Schema.addFix('ARRAY_LENGTH_LONG', truncateArray);
Schema.addFix('ARRAY_ADDITIONAL_ITEMS', removeAdditional);
Schema.addFix('OBJECT_ADDITIONAL_PROPERTIES', removeAdditional);
Schema.addFix('OBJECT_REQUIRED', useDefaultProperty);
Schema.addFix(DEFAULT_FALLBACK, useDefault);
exports.default = Schema;
//# sourceMappingURL=index.js.map