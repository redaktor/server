"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isArrayTypes_1 = require("../../lang/isArrayTypes");
function deepValue(obj, path, list = []) {
    if (!path) {
        list.push(obj);
    }
    else {
        const dotIndex = path.indexOf('.');
        let firstSegment = path;
        let remaining = null;
        if (dotIndex !== -1) {
            firstSegment = path.slice(0, dotIndex);
            remaining = path.slice(dotIndex + 1);
        }
        const value = obj[firstSegment];
        if (value !== null && value !== undefined) {
            if (!remaining && (typeof value === 'string' || typeof value === 'number')) {
                list.push(value.toString());
            }
            else if (isArrayTypes_1.isArray(value)) {
                for (let i = 0, len = value.length; i < len; i += 1) {
                    deepValue(value[i], remaining, list);
                }
            }
            else if (remaining) {
                deepValue(value, remaining, list);
            }
        }
    }
    return list;
}
exports.default = deepValue;
//# sourceMappingURL=deepValue.js.map