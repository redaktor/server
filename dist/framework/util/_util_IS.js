var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toStr = objProto.toString;
var symbolValueOf;
if (typeof Symbol === 'function') {
    symbolValueOf = Symbol.prototype.valueOf;
}
var isActualNaN = function (value) {
    return value !== value;
};
var NON_HOST_TYPES = {
    'boolean': 1,
    number: 1,
    string: 1,
    undefined: 1
};
var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;
var is = module.exports = {};
is.a = is.type = function (value, type) {
    return typeof value === type;
};
is.defined = function (value) {
    return typeof value !== 'undefined';
};
is.empty = function (value) {
    var type = toStr.call(value);
    var key;
    if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
        return value.length === 0;
    }
    if (type === '[object Object]') {
        for (key in value) {
            if (owns.call(value, key)) {
                return false;
            }
        }
        return true;
    }
    return !value;
};
is.equal = function equal(value, other) {
    if (value === other) {
        return true;
    }
    var type = toStr.call(value);
    var key;
    if (type !== toStr.call(other)) {
        return false;
    }
    if (type === '[object Object]') {
        for (key in value) {
            if (!is.equal(value[key], other[key]) || !(key in other)) {
                return false;
            }
        }
        for (key in other) {
            if (!is.equal(value[key], other[key]) || !(key in value)) {
                return false;
            }
        }
        return true;
    }
    if (type === '[object Array]') {
        key = value.length;
        if (key !== other.length) {
            return false;
        }
        while (--key) {
            if (!is.equal(value[key], other[key])) {
                return false;
            }
        }
        return true;
    }
    if (type === '[object Function]') {
        return value.prototype === other.prototype;
    }
    if (type === '[object Date]') {
        return value.getTime() === other.getTime();
    }
    return false;
};
is.hosted = function (value, host) {
    var type = typeof host[value];
    return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};
is.instance = is['instanceof'] = function (value, constructor) {
    return value instanceof constructor;
};
is.nil = is['null'] = function (value) {
    return value === null;
};
is.undef = is.undefined = function (value) {
    return typeof value === 'undefined';
};
is.args = is.arguments = function (value) {
    var isStandardArguments = toStr.call(value) === '[object Arguments]';
    var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
    return isStandardArguments || isOldArguments;
};
is.array = Array.isArray || function (value) {
    return toStr.call(value) === '[object Array]';
};
is.args.empty = function (value) {
    return is.args(value) && value.length === 0;
};
is.array.empty = function (value) {
    return is.array(value) && value.length === 0;
};
is.arraylike = function (value) {
    return !!value && !is.bool(value)
        && owns.call(value, 'length')
        && isFinite(value.length)
        && is.number(value.length)
        && value.length >= 0;
};
is.bool = is['boolean'] = function (value) {
    return toStr.call(value) === '[object Boolean]';
};
is['false'] = function (value) {
    return is.bool(value) && Boolean(Number(value)) === false;
};
is['true'] = function (value) {
    return is.bool(value) && Boolean(Number(value)) === true;
};
is.date = function (value) {
    return toStr.call(value) === '[object Date]';
};
is.element = function (value) {
    return value !== undefined
        && typeof HTMLElement !== 'undefined'
        && value instanceof HTMLElement
        && value.nodeType === 1;
};
is.error = function (value) {
    return toStr.call(value) === '[object Error]';
};
is.fn = is['function'] = function (value) {
    var isAlert = typeof window !== 'undefined' && value === window.alert;
    return isAlert || toStr.call(value) === '[object Function]';
};
is.number = function (value) {
    return toStr.call(value) === '[object Number]';
};
is.infinite = function (value) {
    return value === Infinity || value === -Infinity;
};
is.decimal = function (value) {
    return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};
is.divisibleBy = function (value, n) {
    var isDividendInfinite = is.infinite(value);
    var isDivisorInfinite = is.infinite(n);
    var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
    return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};
is.integer = is['int'] = function (value) {
    return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};
is.maximum = function (value, others) {
    if (isActualNaN(value)) {
        throw new TypeError('NaN is not a valid value');
    }
    else if (!is.arraylike(others)) {
        throw new TypeError('second argument must be array-like');
    }
    var len = others.length;
    while (--len >= 0) {
        if (value < others[len]) {
            return false;
        }
    }
    return true;
};
is.minimum = function (value, others) {
    if (isActualNaN(value)) {
        throw new TypeError('NaN is not a valid value');
    }
    else if (!is.arraylike(others)) {
        throw new TypeError('second argument must be array-like');
    }
    var len = others.length;
    while (--len >= 0) {
        if (value > others[len]) {
            return false;
        }
    }
    return true;
};
is.nan = function (value) {
    return !is.number(value) || value !== value;
};
is.even = function (value) {
    return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};
is.odd = function (value) {
    return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};
is.ge = function (value, other) {
    if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value');
    }
    return !is.infinite(value) && !is.infinite(other) && value >= other;
};
is.gt = function (value, other) {
    if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value');
    }
    return !is.infinite(value) && !is.infinite(other) && value > other;
};
is.le = function (value, other) {
    if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value');
    }
    return !is.infinite(value) && !is.infinite(other) && value <= other;
};
is.lt = function (value, other) {
    if (isActualNaN(value) || isActualNaN(other)) {
        throw new TypeError('NaN is not a valid value');
    }
    return !is.infinite(value) && !is.infinite(other) && value < other;
};
is.within = function (value, start, finish) {
    if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
        throw new TypeError('NaN is not a valid value');
    }
    else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
        throw new TypeError('all arguments must be numbers');
    }
    var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
    return isAnyInfinite || (value >= start && value <= finish);
};
is.object = function (value) {
    return toStr.call(value) === '[object Object]';
};
is.hash = function (value) {
    return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};
is.regexp = function (value) {
    return toStr.call(value) === '[object RegExp]';
};
is.string = function (value) {
    return toStr.call(value) === '[object String]';
};
is.base64 = function (value) {
    return is.string(value) && (!value.length || base64Regex.test(value));
};
is.hex = function (value) {
    return is.string(value) && (!value.length || hexRegex.test(value));
};
is.symbol = function (value) {
    return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
};
//# sourceMappingURL=_util_IS.js.map