"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function is(data, evtType) {
    let type = (typeof data);
    if (data === void 0) {
        type = 'undefined';
    }
    else if (data === null) {
        type = 'null';
    }
    else if (typeof data === 'number') {
        if (isNaN(data)) {
            type = 'NaN';
        }
        else {
            type = ((isFinite(data) && Math.floor(data) === data)) ? 'integer' : 'number';
        }
    }
    else if (typeof data === 'object') {
        type = (data instanceof Array) ? 'array' : 'object';
    }
    else {
        type = (typeof data);
    }
    if (typeof evtType === 'string') {
        return (evtType === 'number' && type === 'integer') ? true : (evtType === type);
    }
    return type;
}
exports.is = is;
//# sourceMappingURL=is.js.map