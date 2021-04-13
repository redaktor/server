"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Symbol_1 = require("@dojo/framework/shim/Symbol");
const main_1 = require("./array/main");
var toS = Object.prototype.toString;
const _SCHEMATYPES = {
    array: { description: 'A JSON array' },
    boolean: { description: 'A JSON boolean.' },
    integer: { description: 'A JSON number without a fraction or exponent part.' },
    number: { description: 'Any JSON number. Number includes integer.' },
    null: { description: 'The JSON null value.' },
    object: { description: 'A JSON object.' },
    string: { description: 'A JSON string.' }
};
exports.TYPES = [
    {
        id: 'null',
        parent: null,
        is: (v) => (v === null),
        from: {
            any: (v) => null,
        }
    },
    {
        id: 'array',
        parent: 'object',
        is: (v) => (v instanceof Array),
        from: {
            string: (s) => {
                if (s.substring(0, 1) === '[' && s.slice(-1) === ']') {
                    try {
                        var n = JSON.parse(s);
                    }
                    catch (e) { }
                    if (Array.isArray(n)) {
                        return n;
                    }
                }
                return s.split(String(',')).map(Function.prototype.call, String.prototype.trim);
            },
            any: (v) => [v]
        }
    },
    {
        id: 'boolean',
        parent: null,
        is: (v) => (typeof v === 'boolean'),
        from: {
            string: (s) => (s.toLowerCase() === 'false') ? false : (!!s),
            any: (v) => (!!v)
        }
    },
    {
        id: 'isodate',
        parent: 'string',
        is: function (v) {
            if (typeof v === 'string') {
                var re = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
                return re.test(v);
            }
            return false;
        },
        from: {
            string: function (v) {
                var d = '0000'.substr(0, 4 - v.length) + v;
                d += '0000-01-01T00:00:00Z'.substring(v.length);
                return exports.to(d, 'date');
            }
        }
    },
    {
        id: 'date',
        parent: 'object',
        is: (v) => (v instanceof Date),
        from: {
            integer: function (v) {
                const d = new Date(v);
                return (isNaN(d.getTime())) ? void 0 : d;
            },
            number: function (v) {
                const d = new Date(v);
                return (isNaN(d.getTime())) ? void 0 : d;
            },
            string: function (v) {
                var d;
                var isoDate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/.exec(v);
                if (isoDate) {
                    d = new Date(Date.UTC(+isoDate[1], +isoDate[2] - 1, +isoDate[3], +isoDate[4], +isoDate[5], +isoDate[6], +isoDate[7] || 0));
                }
                else {
                    d = new Date(+v);
                }
                return (isNaN(d.getTime())) ? void 0 : d;
            }
        }
    },
    {
        id: 'integer',
        parent: 'number',
        is: (v) => (((isFinite(v) && Math.floor(v) === v))),
        from: {
            string: (s) => {
                if (!s.trim().length) {
                    return s;
                }
                var n = Number(String(s.replace(/ /g, '')));
                if (typeof n === 'number') {
                    return (isNaN(n)) ? s : n;
                }
            },
            number: (n) => Math.round(n),
            boolean: (b) => (b === true) ? 1 : 0,
            date: (d) => +d
        }
    },
    {
        id: 'number',
        parent: null,
        is: (v) => (typeof v === 'number'),
        from: {
            string: (s) => {
                if (!s.trim().length) {
                    return s;
                }
                var n = Number(String(s.replace(/,/g, '.').replace(/ /g, '')));
                return ((isNaN(n) === true) ? void 0 : n);
            },
            boolean: (b) => (b === true) ? 1 : 0,
            date: (d) => +d
        }
    },
    {
        id: 'object',
        parent: null,
        is: (v) => (typeof v === 'object'),
        from: {
            array: (a) => {
                return a.reduce(function (o, v, i) {
                    o[i.toString()] = v;
                    return o;
                }, {});
            },
            string: (s) => {
                var o = s;
                try {
                    o = JSON.parse(s);
                }
                catch (e) {
                    return void 0;
                }
                return (typeof o === 'object') ? o : s;
            }
        }
    },
    {
        id: 'string',
        parent: null,
        is: (v) => (typeof v === 'string'),
        from: {
            symbol: (v) => (Symbol_1.default && Symbol_1.default.prototype.toString) ? Symbol_1.default.prototype.toString.call(v) : '',
            boolean: (b) => b.toString(),
            date: (d) => d.toString(),
            any: (v) => {
                var result = (v + '');
                return (result == '0' && (1 / v) === -(1 / 0)) ? '-0' : result;
            }
        }
    },
    {
        id: 'symbol',
        parent: null,
        is: (v) => (typeof v === 'symbol' || (v && typeof v === 'object' && toS.call(v) === '[object Symbol]')),
        from: {}
    },
    {
        id: 'regex',
        parent: 'object',
        is: (v) => ((v instanceof RegExp) && v.ignoreCase),
        from: {
            glob: (s) => {
                s = s.replace(/([\\|\||\(|\)|\[|\{|\^|\$|\*|\+|\?|\.|\<|\>])/g, function (x) { return '\\' + x; }).replace(/\\\*/g, '.*').replace(/\\\?/g, '.?');
                if (s.substring(0, 2) !== '.*') {
                    s = '^' + s;
                }
                else {
                    s = s.substring(2);
                }
                if (s.substring(s.length - 2) !== '.*') {
                    s = s + '$';
                }
                else {
                    s = s.substring(0, s.length - 2);
                }
                return new RegExp(s, 'i');
            },
            string: (s) => new RegExp(s, 'i')
        }
    },
    {
        id: 'REGEX',
        parent: 'object',
        is: (v) => ((v instanceof RegExp)),
        from: {
            string: (s) => new RegExp(s)
        }
    },
    {
        id: 'glob',
        parent: 'string',
        is: function (v) {
            if (typeof v === 'string' && v.indexOf('*') > -1) {
                return true;
            }
            return false;
        },
        from: {}
    },
    {
        id: 'TEST',
        parent: 'glob',
        is: function (v) {
            if (typeof v === 'string' && v.indexOf('**') > -1) {
                return true;
            }
            return false;
        },
        from: {}
    }
];
exports.TYPEMAP = {};
exports.TYPETREE = main_1.toTree(exports.TYPES);
exports.TYPES.map((rootO, i) => {
    if (typeof rootO.id === 'string') {
        exports.TYPEMAP[rootO.id] = i;
        if (_SCHEMATYPES.hasOwnProperty(rootO.id)) {
            _SCHEMATYPES[rootO.id].format = rootO;
        }
    }
});
exports.SCHEMATYPES = _SCHEMATYPES;
//# sourceMappingURL=formats.js.map