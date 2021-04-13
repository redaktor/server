"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formats_1 = require("./formats");
const is_1 = require("./is");
function to(data, type) {
    var toO = formats_1.TYPES[formats_1.TYPEMAP[type]];
    if (!is_1.is(toO, 'object') || is_1.is(data, type)) {
        return data;
    }
    const formats = is_1.isAn(data).reverse();
    var coerced;
    for (var f = 0; f < formats.length; f++) {
        var key = formats[f];
        if (toO.from && typeof toO.from[key] === 'function') {
            coerced = toO.from[key](data);
        }
        else if (toO.from && typeof toO.from.any === 'function') {
            coerced = toO.from.any(data);
        }
        if (is_1.isAn(coerced, type)) {
            data = coerced;
            break;
        }
    }
    return data;
}
exports.to = to;
//# sourceMappingURL=to.js.map