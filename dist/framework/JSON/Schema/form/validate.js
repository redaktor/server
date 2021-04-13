"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_topath_1 = require("lodash.topath");
const ajv_1 = require("ajv");
const ajv = new ajv_1.default({
    errorDataPath: "property",
    allErrors: true,
});
ajv.addFormat("data-url", /^data:([a-z]+\/[a-z0-9-+.]+)?;name=(.*);base64,(.*)$/);
ajv.addFormat("color", /^(#?([0-9A-Fa-f]{3}){1,2}\b|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\)))$/);
const utils_1 = require("./utils");
function toErrorSchema(errors) {
    if (!errors.length) {
        return {};
    }
    return errors.reduce((errorSchema, error) => {
        const { property, message } = error;
        const path = lodash_topath_1.default(property);
        let parent = errorSchema;
        if (path.length > 0 && path[0] === "") {
            path.splice(0, 1);
        }
        for (const segment of path.slice(0)) {
            if (!(segment in parent)) {
                parent[segment] = {};
            }
            parent = parent[segment];
        }
        if (Array.isArray(parent.__errors)) {
            parent.__errors = parent.__errors.concat(message);
        }
        else {
            parent.__errors = [message];
        }
        return errorSchema;
    }, {});
}
function toErrorList(errorSchema, fieldName = "root") {
    let errorList = [];
    if ("__errors" in errorSchema) {
        errorList = errorList.concat(errorSchema.__errors.map(stack => {
            return {
                stack: `${fieldName}: ${stack}`,
            };
        }));
    }
    return Object.keys(errorSchema).reduce((acc, key) => {
        if (key !== "__errors") {
            acc = acc.concat(toErrorList(errorSchema[key], key));
        }
        return acc;
    }, errorList);
}
exports.toErrorList = toErrorList;
function createErrorHandler(formData) {
    const handler = {
        __errors: [],
        addError(message) {
            this.__errors.push(message);
        },
    };
    if (utils_1.isObject(formData)) {
        return Object.keys(formData).reduce((acc, key) => {
            return Object.assign(Object.assign({}, acc), { [key]: createErrorHandler(formData[key]) });
        }, handler);
    }
    if (Array.isArray(formData)) {
        return formData.reduce((acc, value, key) => {
            return Object.assign(Object.assign({}, acc), { [key]: createErrorHandler(value) });
        }, handler);
    }
    return handler;
}
function unwrapErrorHandler(errorHandler) {
    return Object.keys(errorHandler).reduce((acc, key) => {
        if (key === "addError") {
            return acc;
        }
        else if (key === "__errors") {
            return Object.assign(Object.assign({}, acc), { [key]: errorHandler[key] });
        }
        return Object.assign(Object.assign({}, acc), { [key]: unwrapErrorHandler(errorHandler[key]) });
    }, {});
}
function transformAjvErrors(errors = []) {
    if (errors === null) {
        return [];
    }
    return errors.map(e => {
        const { dataPath, keyword, message, params } = e;
        let property = `${dataPath}`;
        return {
            name: keyword,
            property,
            message,
            params,
            stack: `${property} ${message}`.trim(),
        };
    });
}
function validateFormData(formData, schema, customValidate, transformErrors) {
    ajv.validate(schema, formData);
    let errors = transformAjvErrors(ajv.errors);
    if (typeof transformErrors === "function") {
        errors = transformErrors(errors);
    }
    const errorSchema = toErrorSchema(errors);
    if (typeof customValidate !== "function") {
        return { errors, errorSchema };
    }
    const errorHandler = customValidate(formData, createErrorHandler(formData));
    const userErrorSchema = unwrapErrorHandler(errorHandler);
    const newErrorSchema = utils_1.mergeObjects(errorSchema, userErrorSchema, true);
    const newErrors = toErrorList(newErrorSchema);
    return { errors: newErrors, errorSchema: newErrorSchema };
}
exports.default = validateFormData;
//# sourceMappingURL=validate.js.map