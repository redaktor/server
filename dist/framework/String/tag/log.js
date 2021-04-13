"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/core/has");
const R = [31, '#DC0005'];
const G = [32, '#95CC0D'];
const B = [34, '#0D7ECC'];
const C = [36, '#1397A3'];
const M = [35, '#CC0D5A'];
const Y = [33, '#FFAF00'];
const K = [30, '#1C191B'];
const W = [37, '#F5F5F5'];
const gray = [90, '#74757A'];
const colorCodes = {
    R, red: R, error: R,
    G, green: G, success: G,
    B, blue: B, info: B,
    C, cyan: C,
    M, magenta: M,
    Y, yellow: Y, warning: Y,
    K, black: K,
    W, white: W,
    gray, grey: G, muted: G,
    reset: ['', '']
};
const prefixes = {
    reset: ' ',
    message: ' ',
    success: '*',
    warning: '!',
    error: '!',
    list: '*',
    input: '<',
    output: '>',
    neutral: '*',
    muted: '*'
};
const types = {
    _string: 'G',
    _number: 'B',
    _function: 'Y',
    _key: 'M',
    _null: 'gray',
    _undefined: 'gray',
    _boolean: 'reset',
};
const prefixFns = Object.keys(prefixes).reduce((o, prefix) => {
    o[prefix] = (strings, ...values) => {
        const logArgs = _(strings, ...values);
        logArgs[0] = coloredStr(`${prefixes[prefix]} ${logArgs[0]}`, prefix);
        console.log(...logArgs);
        return logArgs[0];
    };
    return o;
}, {});
function _(strings, ...values) {
    const browserColors = [];
    const s = strings.reduce((result, string, i) => {
        let v = Array.isArray(values[i]) ? values[i].join(' ') : values[i];
        const color = Object.keys(colorCodes).filter(k => string.endsWith(`${k}`))[0];
        if (color) {
            string = string.slice(0, 0 - color.length);
            v = coloredStr(v, color, browserColors);
        }
        return `${result}${string}${v ? `${v}` : ''}`;
    }, '');
    return [s, ...browserColors];
}
exports._ = _;
function log(strings, ...values) {
    const logArgs = _(strings, ...values);
    console.log(' ', ...logArgs);
    return logArgs[0];
}
exports.log = log;
exports.reset = prefixFns.reset, exports.message = prefixFns.message, exports.success = prefixFns.success, exports.warning = prefixFns.warning, exports.error = prefixFns.error, exports.list = prefixFns.list, exports.input = prefixFns.input, exports.output = prefixFns.output, exports.neutral = prefixFns.neutral, exports.muted = prefixFns.muted;
function info(...strings) {
    log `G${` ╚════╝`}`;
    log `G${` ╔════╗`}`;
    log `G${` ║    ║`}`;
    log `G${` ║    ║`} ${strings.join(' ')}`;
}
exports.info = info;
function coloredStr(v, color, browserColors = []) {
    if (!colorCodes[color]) {
        return v;
    }
    if (has_1.default('host-node')) {
        const code = colorCodes[color][0];
        v = `\u001b[${code}m${v}\u001b[${!!code ? '39' : ''}m`;
    }
    else {
        const hex = colorCodes[color][0];
        v = `%c${v}`;
        browserColors.push(`color: ${hex}`);
    }
    return v;
}
function syntaxLog(prefix, key, value, includeFn) {
    if (typeof console === 'undefined') {
        return;
    }
    if ((prefix === '<' || prefix === '>') && typeof value === 'string' &&
        /^(http|\/|.\/|..\/)/i.test(value)) {
        console.log(prefix, key, syntaxColor(value, 'gray'));
    }
    else if (!!value && typeof value === 'object' && key.length && Object.keys(value).length) {
        console.log(prefix, key, syntaxColor('\u27C0', 'yellow'));
        console.log(syntaxHighlight(JSON.stringify(value, null, 2)));
    }
    else if (value === void 0 || value === null) {
        const strValue = (value === void 0) ? 'undefined' : 'null';
        console.log(prefix, key, syntaxColor(strValue, 'gray'));
    }
    else if (typeof value === 'function') {
        if (includeFn) {
            console.log(prefix, syntaxColor(key, 'yellow'), value);
        }
        else {
            return void 0;
        }
    }
    else {
        console.log(prefix, key, syntaxHighlight(JSON.stringify(value)));
    }
}
exports.syntaxLog = syntaxLog;
function dumpError(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nERROR Message: ' + err.message);
        }
        if (err.stack) {
            console.log('\nStacktrace:');
            console.log('====================');
            console.log(err.stack);
        }
    }
    else {
        console.log('dumpError :: argument is not an object');
    }
}
exports.dumpError = dumpError;
function syntaxColor(v, color) {
    if (typeof color === 'string' && colorCodes.hasOwnProperty(color)) {
        return coloredStr(v, color);
    }
    var cType = types._number;
    if (/^"/.test(v)) {
        cType = /:$/.test(v) ? types._key : types._string;
    }
    else if (/true|false/.test(v)) {
        cType = types._boolean;
    }
    else if (/null|undefined/.test(v)) {
        cType = types._null;
    }
    return coloredStr(v, cType);
}
exports.syntaxColor = syntaxColor;
function syntaxHighlight(value) {
    const fn = (v, color) => syntaxColor(v, color);
    return value.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, fn);
}
exports.syntaxHighlight = syntaxHighlight;
function pwStr(str, padding = 1) {
    str = `${str}`;
    if ((padding * 2) > str.length - 3) {
        padding = 1;
    }
    const secretStr = new Array(str.length + 1 - padding).join('*');
    return ([str.slice(0, padding), secretStr, str.slice(0 - padding)].join(''));
}
exports.pwStr = pwStr;
function _log(logArr, doPadding = false, includeFn = true) {
    if (typeof console === 'undefined') {
        return;
    }
    if (!(logArr instanceof Array)) {
        logArr = [logArr];
    }
    logArr.forEach((o) => {
        const isPrefix = prefixes.hasOwnProperty(Object.keys(o)[0]);
        let prefix = ':';
        if (typeof o != 'object' || Object.keys(o).length > 1 || !isPrefix) {
            console.log(':', o);
        }
        else {
            const key = Object.keys(o)[0];
            const isSyntax = !(colorCodes.hasOwnProperty(key));
            prefix = prefixes.hasOwnProperty(key) ? prefixes[key] : ' ';
            if (typeof o[key] != 'object') {
                if (isSyntax) {
                    syntaxLog(prefix, '', o[key], includeFn);
                }
                else {
                    console.log(' ', o[key]);
                }
            }
            else if (Array.isArray(o[key])) {
                o[key].forEach((v) => {
                    syntaxLog(prefix, '', v, includeFn);
                });
            }
            else {
                for (var logKey in o[key]) {
                    var k = logKey;
                    const v = o[key][k];
                    if (typeof v != 'function' && doPadding) {
                        k = new Array(Object.keys(o[key]).reduce((a, b) => {
                            return a.length > b.length ? a : b;
                        }).length + 1).join(' ');
                        k = ([k || ' ', logKey].join(' ')).slice(-k.length - 1);
                    }
                    syntaxLog(prefix, k + ':', v, includeFn);
                }
            }
        }
    });
}
exports._log = _log;
//# sourceMappingURL=log.js.map