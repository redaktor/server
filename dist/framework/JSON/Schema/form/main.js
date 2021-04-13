"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("setimmediate");
const validate_1 = require("./validate");
const widgetMap = {
    boolean: {
        checkbox: "CheckboxWidget",
        radio: "RadioWidget",
        select: "SelectWidget",
        hidden: "HiddenWidget",
    },
    string: {
        text: "TextWidget",
        password: "PasswordWidget",
        email: "EmailWidget",
        hostname: "TextWidget",
        ipv4: "TextWidget",
        ipv6: "TextWidget",
        uri: "URLWidget",
        "data-url": "FileWidget",
        radio: "RadioWidget",
        select: "SelectWidget",
        textarea: "TextareaWidget",
        hidden: "HiddenWidget",
        date: "DateWidget",
        datetime: "DateTimeWidget",
        "date-time": "DateTimeWidget",
        "alt-date": "AltDateWidget",
        "alt-datetime": "AltDateTimeWidget",
        color: "ColorWidget",
        file: "FileWidget",
    },
    number: {
        text: "TextWidget",
        select: "SelectWidget",
        updown: "UpDownWidget",
        range: "RangeWidget",
        radio: "RadioWidget",
        hidden: "HiddenWidget",
    },
    integer: {
        text: "TextWidget",
        select: "SelectWidget",
        updown: "UpDownWidget",
        range: "RangeWidget",
        radio: "RadioWidget",
        hidden: "HiddenWidget",
    },
    array: {
        select: "SelectWidget",
        checkboxes: "CheckboxesWidget",
        files: "FileWidget",
    },
};
function getDefaultRegistry() {
    return {
        fields: require("./components/fields").default,
        widgets: require("./components/widgets").default,
        definitions: {},
        formContext: {},
    };
}
exports.getDefaultRegistry = getDefaultRegistry;
function getSchemaType(schema) {
    let { type } = schema;
    if (!type && schema.enum) {
        type = "string";
    }
    return type;
}
exports.getSchemaType = getSchemaType;
function getWidget(schema, widget, registeredWidgets = {}) {
    const type = getSchemaType(schema);
    function mergeOptions(Widget) {
        if (!Widget.MergedWidget) {
            const defaultOptions = (Widget.defaultProps && Widget.defaultProps.options) || {};
            Widget.MergedWidget = (_a) => {
                var { options = {} } = _a, props = tslib_1.__rest(_a, ["options"]);
                return options = {};
            };
            {
                defaultOptions, ;
                options;
            }
        }
        {
            props;
        }
        />;
        ;
    }
    return Widget.MergedWidget;
}
exports.getWidget = getWidget;
if (typeof widget === "function") {
    return mergeOptions(widget);
}
if (typeof widget !== "string") {
    throw new Error(`Unsupported widget definition: ${typeof widget}`);
}
if (registeredWidgets.hasOwnProperty(widget)) {
    const registeredWidget = registeredWidgets[widget];
    return getWidget(schema, registeredWidget, registeredWidgets);
}
if (!widgetMap.hasOwnProperty(type)) {
    throw new Error(`No widget for type "${type}"`);
}
if (widgetMap[type].hasOwnProperty(widget)) {
    const registeredWidget = registeredWidgets[widgetMap[type][widget]];
    return getWidget(schema, registeredWidget, registeredWidgets);
}
throw new Error(`No widget "${widget}" for type "${type}"`);
function computeDefaults(schema, parentDefaults, definitions = {}) {
    let defaults = parentDefaults;
    if (isObject(defaults) && isObject(schema.default)) {
        defaults = mergeObjects(defaults, schema.default);
    }
    else if ("default" in schema) {
        defaults = schema.default;
    }
    else if ("$ref" in schema) {
        const refSchema = findSchemaDefinition(schema.$ref, definitions);
        return computeDefaults(refSchema, defaults, definitions);
    }
    else if (isFixedItems(schema)) {
        defaults = schema.items.map(itemSchema => computeDefaults(itemSchema, undefined, definitions));
    }
    if (typeof defaults === "undefined") {
        defaults = schema.default;
    }
    switch (schema.type) {
        case "object":
            return Object.keys(schema.properties || {}).reduce((acc, key) => {
                acc[key] = computeDefaults(schema.properties[key], (defaults || {})[key], definitions);
                return acc;
            }, {});
        case "array":
            if (schema.minItems) {
                if (!isMultiSelect(schema, definitions)) {
                    const defaultsLength = defaults ? defaults.length : 0;
                    if (schema.minItems > defaultsLength) {
                        const defaultEntries = defaults || [];
                        const fillerEntries = new Array(schema.minItems - defaultsLength).fill(computeDefaults(schema.items, schema.items.defaults, definitions));
                        return defaultEntries.concat(fillerEntries);
                    }
                }
                else {
                    return [];
                }
            }
    }
    return defaults;
}
function getDefaultFormState(_schema, formData, definitions = {}) {
    if (!isObject(_schema)) {
        throw new Error("Invalid schema: " + _schema);
    }
    const schema = retrieveSchema(_schema, definitions, formData);
    const defaults = computeDefaults(schema, _schema.default, definitions);
    if (typeof formData === "undefined") {
        return defaults;
    }
    if (isObject(formData)) {
        return mergeObjects(defaults, formData);
    }
    return formData || defaults;
}
exports.getDefaultFormState = getDefaultFormState;
function getUiOptions(uiSchema) {
    return Object.keys(uiSchema)
        .filter(key => key.indexOf("ui:") === 0)
        .reduce((options, key) => {
        const value = uiSchema[key];
        if (key === "ui:widget" && isObject(value)) {
            console.warn("Setting options via ui:widget object is deprecated, use ui:options instead");
            return Object.assign(Object.assign(Object.assign({}, options), (value.options || {})), { widget: value.component });
        }
        if (key === "ui:options" && isObject(value)) {
            return Object.assign(Object.assign({}, options), value);
        }
        return Object.assign(Object.assign({}, options), { [key.substring(3)]: value });
    }, {});
}
exports.getUiOptions = getUiOptions;
function isObject(thing) {
    return typeof thing === "object" && thing !== null && !Array.isArray(thing);
}
exports.isObject = isObject;
function mergeObjects(obj1, obj2, concatArrays = false) {
    var acc = Object.assign({}, obj1);
    return Object.keys(obj2).reduce((acc, key) => {
        const left = obj1[key], right = obj2[key];
        if (obj1.hasOwnProperty(key) && isObject(right)) {
            acc[key] = mergeObjects(left, right, concatArrays);
        }
        else if (concatArrays && Array.isArray(left) && Array.isArray(right)) {
            acc[key] = left.concat(right);
        }
        else {
            acc[key] = right;
        }
        return acc;
    }, acc);
}
exports.mergeObjects = mergeObjects;
function asNumber(value) {
    if (value === "") {
        return undefined;
    }
    if (/\.$/.test(value)) {
        return value;
    }
    if (/\.0$/.test(value)) {
        return value;
    }
    const n = Number(value);
    const valid = typeof n === "number" && !Number.isNaN(n);
    if (/\.\d*0$/.test(value)) {
        return value;
    }
    return valid ? n : value;
}
exports.asNumber = asNumber;
function orderProperties(properties, order) {
    if (!Array.isArray(order)) {
        return properties;
    }
    const arrayToHash = arr => arr.reduce((prev, curr) => {
        prev[curr] = true;
        return prev;
    }, {});
    const errorPropList = arr => arr.length > 1
        ? `properties '${arr.join("', '")}'`
        : `property '${arr[0]}'`;
    const propertyHash = arrayToHash(properties);
    const orderHash = arrayToHash(order);
    const extraneous = order.filter(prop => prop !== "*" && !propertyHash[prop]);
    if (extraneous.length) {
        throw new Error(`uiSchema order list contains extraneous ${errorPropList(extraneous)}`);
    }
    const rest = properties.filter(prop => !orderHash[prop]);
    const restIndex = order.indexOf("*");
    if (restIndex === -1) {
        if (rest.length) {
            throw new Error(`uiSchema order list does not contain ${errorPropList(rest)}`);
        }
        return order;
    }
    if (restIndex !== order.lastIndexOf("*")) {
        throw new Error("uiSchema order list contains more than one wildcard item");
    }
    const complete = [...order];
    complete.splice(restIndex, 1, ...rest);
    return complete;
}
exports.orderProperties = orderProperties;
function isConstant(schema) {
    return ((Array.isArray(schema.enum) && schema.enum.length === 1) ||
        schema.hasOwnProperty("const"));
}
exports.isConstant = isConstant;
function toConstant(schema) {
    if (Array.isArray(schema.enum) && schema.enum.length === 1) {
        return schema.enum[0];
    }
    else if (schema.hasOwnProperty("const")) {
        return schema.const;
    }
    else {
        throw new Error("schema cannot be inferred as a constant");
    }
}
exports.toConstant = toConstant;
function isSelect(_schema, definitions = {}) {
    const schema = retrieveSchema(_schema, definitions);
    const altSchemas = schema.oneOf || schema.anyOf;
    if (Array.isArray(schema.enum)) {
        return true;
    }
    else if (Array.isArray(altSchemas)) {
        return altSchemas.every(altSchemas => isConstant(altSchemas));
    }
    return false;
}
exports.isSelect = isSelect;
function isMultiSelect(schema, definitions = {}) {
    if (!schema.uniqueItems || !schema.items) {
        return false;
    }
    return isSelect(schema.items, definitions);
}
exports.isMultiSelect = isMultiSelect;
function isFilesArray(schema, uiSchema, definitions = {}) {
    if (uiSchema["ui:widget"] === "files") {
        return true;
    }
    else if (schema.items) {
        const itemsSchema = retrieveSchema(schema.items, definitions);
        return itemsSchema.type === "string" && itemsSchema.format === "data-url";
    }
    return false;
}
exports.isFilesArray = isFilesArray;
function isFixedItems(schema) {
    return (Array.isArray(schema.items) &&
        schema.items.length > 0 &&
        schema.items.every(item => isObject(item)));
}
exports.isFixedItems = isFixedItems;
function allowAdditionalItems(schema) {
    if (schema.additionalItems === true) {
        console.warn("additionalItems=true is currently not supported");
    }
    return isObject(schema.additionalItems);
}
exports.allowAdditionalItems = allowAdditionalItems;
function optionsList(schema) {
    if (schema.enum) {
        return schema.enum.map((value, i) => {
            const label = (schema.enumNames && schema.enumNames[i]) || String(value);
            return { label, value };
        });
    }
    else {
        const altSchemas = schema.oneOf || schema.anyOf;
        return altSchemas.map((schema, i) => {
            const value = toConstant(schema);
            const label = schema.title || String(value);
            return { label, value };
        });
    }
}
exports.optionsList = optionsList;
function findSchemaDefinition($ref, definitions = {}) {
    const match = /^#\/definitions\/(.*)$/.exec($ref);
    if (match && match[1]) {
        const parts = match[1].split("/");
        let current = definitions;
        for (let part of parts) {
            part = part.replace(/~1/g, "/").replace(/~0/g, "~");
            if (current.hasOwnProperty(part)) {
                current = current[part];
            }
            else {
                throw new Error(`Could not find a definition for ${$ref}.`);
            }
        }
        return current;
    }
    throw new Error(`Could not find a definition for ${$ref}.`);
}
function retrieveSchema(schema, definitions = {}, formData = {}) {
    if (schema.hasOwnProperty("$ref")) {
        const $refSchema = findSchemaDefinition(schema.$ref, definitions);
        const { $ref } = schema, localSchema = tslib_1.__rest(schema, ["$ref"]);
        return retrieveSchema(Object.assign(Object.assign({}, $refSchema), localSchema), definitions, formData);
    }
    else if (schema.hasOwnProperty("dependencies")) {
        const resolvedSchema = resolveDependencies(schema, definitions, formData);
        return retrieveSchema(resolvedSchema, definitions, formData);
    }
    else {
        return schema;
    }
}
exports.retrieveSchema = retrieveSchema;
function resolveDependencies(schema, definitions, formData) {
    let { dependencies = {} } = schema, resolvedSchema = tslib_1.__rest(schema, ["dependencies"]);
    for (const dependencyKey in dependencies) {
        if (formData[dependencyKey] === undefined) {
            continue;
        }
        const dependencyValue = dependencies[dependencyKey];
        if (Array.isArray(dependencyValue)) {
            resolvedSchema = withDependentProperties(resolvedSchema, dependencyValue);
        }
        else if (isObject(dependencyValue)) {
            resolvedSchema = withDependentSchema(resolvedSchema, definitions, formData, dependencyKey, dependencyValue);
        }
    }
    return resolvedSchema;
}
function withDependentProperties(schema, additionallyRequired) {
    if (!additionallyRequired) {
        return schema;
    }
    const required = Array.isArray(schema.required)
        ? Array.from(new Set([...schema.required, ...additionallyRequired]))
        : additionallyRequired;
    return Object.assign(Object.assign({}, schema), { required: required });
}
function withDependentSchema(schema, definitions, formData, dependencyKey, dependencyValue) {
    let _a = retrieveSchema(dependencyValue, definitions, formData), { oneOf } = _a, dependentSchema = tslib_1.__rest(_a, ["oneOf"]);
    schema = mergeSchemas(schema, dependentSchema);
    return oneOf === undefined
        ? schema
        : withExactlyOneSubschema(schema, definitions, formData, dependencyKey, oneOf);
}
function withExactlyOneSubschema(schema, definitions, formData, dependencyKey, oneOf) {
    if (!Array.isArray(oneOf)) {
        throw new Error(`invalid oneOf: it is some ${typeof oneOf} instead of an array`);
    }
    const validSubschemas = oneOf.filter(subschema => {
        if (!subschema.properties) {
            return false;
        }
        const { [dependencyKey]: conditionPropertySchema } = subschema.properties;
        if (conditionPropertySchema) {
            const conditionSchema = {
                type: "object",
                properties: {
                    [dependencyKey]: conditionPropertySchema,
                },
            };
            const { errors } = validate_1.default(formData, conditionSchema);
            return errors.length === 0;
        }
    });
    if (validSubschemas.length !== 1) {
        console.warn("ignoring oneOf in dependencies because there isn't exactly one subschema that is valid");
        return schema;
    }
    const subschema = validSubschemas[0];
    const _a = subschema.properties, _b = dependencyKey, conditionPropertySchema = _a[_b], dependentSubschema = tslib_1.__rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
    const dependentSchema = Object.assign(Object.assign({}, subschema), { properties: dependentSubschema });
    return mergeSchemas(schema, retrieveSchema(dependentSchema, definitions, formData));
}
function mergeSchemas(schema1, schema2) {
    return mergeObjects(schema1, schema2, true);
}
function isArguments(object) {
    return Object.prototype.toString.call(object) === "[object Arguments]";
}
function deepEquals(a, b, ca = [], cb = []) {
    if (a === b) {
        return true;
    }
    else if (typeof a === "function" || typeof b === "function") {
        return true;
    }
    else if (typeof a !== "object" || typeof b !== "object") {
        return false;
    }
    else if (a === null || b === null) {
        return false;
    }
    else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    else if (a instanceof RegExp && b instanceof RegExp) {
        return (a.source === b.source &&
            a.global === b.global &&
            a.multiline === b.multiline &&
            a.lastIndex === b.lastIndex &&
            a.ignoreCase === b.ignoreCase);
    }
    else if (isArguments(a) || isArguments(b)) {
        if (!(isArguments(a) && isArguments(b))) {
            return false;
        }
        let slice = Array.prototype.slice;
        return deepEquals(slice.call(a), slice.call(b), ca, cb);
    }
    else {
        if (a.constructor !== b.constructor) {
            return false;
        }
        let ka = Object.keys(a);
        let kb = Object.keys(b);
        if (ka.length === 0 && kb.length === 0) {
            return true;
        }
        if (ka.length !== kb.length) {
            return false;
        }
        let cal = ca.length;
        while (cal--) {
            if (ca[cal] === a) {
                return cb[cal] === b;
            }
        }
        ca.push(a);
        cb.push(b);
        ka.sort();
        kb.sort();
        for (var j = ka.length - 1; j >= 0; j--) {
            if (ka[j] !== kb[j]) {
                return false;
            }
        }
        let key;
        for (let k = ka.length - 1; k >= 0; k--) {
            key = ka[k];
            if (!deepEquals(a[key], b[key], ca, cb)) {
                return false;
            }
        }
        ca.pop();
        cb.pop();
        return true;
    }
}
exports.deepEquals = deepEquals;
function shouldRender(comp, nextProps, nextState) {
    const { props, state } = comp;
    return !deepEquals(props, nextProps) || !deepEquals(state, nextState);
}
exports.shouldRender = shouldRender;
function toIdSchema(schema, id, definitions, formData = {}, idPrefix = "root") {
    const idSchema = {
        $id: id || idPrefix,
    };
    if ("$ref" in schema) {
        const _schema = retrieveSchema(schema, definitions, formData);
        return toIdSchema(_schema, id, definitions, formData, idPrefix);
    }
    if ("items" in schema && !schema.items.$ref) {
        return toIdSchema(schema.items, id, definitions, formData, idPrefix);
    }
    if (schema.type !== "object") {
        return idSchema;
    }
    for (const name in schema.properties || {}) {
        const field = schema.properties[name];
        const fieldId = idSchema.$id + "_" + name;
        idSchema[name] = toIdSchema(field, fieldId, definitions, formData[name], idPrefix);
    }
    return idSchema;
}
exports.toIdSchema = toIdSchema;
function parseDateString(dateString, includeTime = true) {
    if (!dateString) {
        return {
            year: -1,
            month: -1,
            day: -1,
            hour: includeTime ? -1 : 0,
            minute: includeTime ? -1 : 0,
            second: includeTime ? -1 : 0,
        };
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        throw new Error("Unable to parse date " + dateString);
    }
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: includeTime ? date.getUTCHours() : 0,
        minute: includeTime ? date.getUTCMinutes() : 0,
        second: includeTime ? date.getUTCSeconds() : 0,
    };
}
exports.parseDateString = parseDateString;
function toDateString({ year, month, day, hour = 0, minute = 0, second = 0 }, time = true) {
    const utcTime = Date.UTC(year, month - 1, day, hour, minute, second);
    const datetime = new Date(utcTime).toJSON();
    return time ? datetime : datetime.slice(0, 10);
}
exports.toDateString = toDateString;
function pad(num, size) {
    let s = String(num);
    while (s.length < size) {
        s = "0" + s;
    }
    return s;
}
exports.pad = pad;
function setState(instance, state, callback) {
    const { safeRenderCompletion } = instance.props;
    if (safeRenderCompletion) {
        instance.setState(state, callback);
    }
    else {
        instance.setState(state);
        setImmediate(callback);
    }
}
exports.setState = setState;
function dataURItoBlob(dataURI) {
    const splitted = dataURI.split(",");
    const params = splitted[0].split(";");
    const type = params[0].replace("data:", "");
    const properties = params.filter(param => {
        return param.split("=")[0] === "name";
    });
    let name;
    if (properties.length !== 1) {
        name = "unknown";
    }
    else {
        name = properties[0].split("=")[1];
    }
    const binary = atob(splitted[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    const blob = new window.Blob([new Uint8Array(array)], { type });
    return { blob, name };
}
exports.dataURItoBlob = dataURItoBlob;
function rangeSpec(schema) {
    const spec = {};
    if (schema.multipleOf) {
        spec.step = schema.multipleOf;
    }
    if (schema.minimum || schema.minimum === 0) {
        spec.min = schema.minimum;
    }
    if (schema.maximum || schema.maximum === 0) {
        spec.max = schema.maximum;
    }
    return spec;
}
exports.rangeSpec = rangeSpec;
//# sourceMappingURL=main.js.map