"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let handlers;
if (typeof Reflect === 'undefined') {
    require('harmony-reflect');
}
function wrap(target) {
    if (typeof target === 'object' && target && typeof target.then === 'function') {
        var targetFunc = function () { return target; };
        targetFunc._promiseChainCache = Object.create(null);
        return new Proxy(targetFunc, handlers);
    }
    return target;
}
exports.default = wrap;
;
handlers = {
    get: function (target, prop) {
        console.log('1 get function', prop);
        if (prop === 'inspect') {
            return function () { return '[chainable Promise]'; };
        }
        if (prop === '_raw') {
            return target();
        }
        if (typeof prop === 'symbol') {
            return target()[prop];
        }
        if (prop in target()) {
            const isFn = typeof target()[prop] === 'function';
            if (prop !== 'constructor' && !prop.startsWith('_') && isFn) {
                return function () {
                    return wrap(target()[prop].apply(target(), arguments));
                };
            }
            return target()[prop];
        }
        if (Object.prototype.hasOwnProperty.call(target._promiseChainCache, prop)) {
            return target._promiseChainCache[prop];
        }
        const isValueFn = typeof target().value === 'function';
        if (target().isFulfilled && target().isFulfilled() && isValueFn) {
            return wrap(target().constructor.resolve(target().value()[prop]));
        }
        target._promiseChainCache[prop] = wrap(target().then(function (result) {
            if (result && (typeof result === 'object' || typeof result === 'function')) {
                return wrap(result[prop]);
            }
            const _p = `"${prop}" of "${result}".`;
            throw new TypeError(`Promise chain rejection: Cannot read property ${_p}`);
        }));
        return target._promiseChainCache[prop];
    },
    apply: function (target, thisArg, args) {
        console.log('2 call function', target());
        return wrap(target().constructor.all([target(), thisArg]).then(function (results) {
            if (typeof results[0] === 'function') {
                return wrap(Reflect.apply(results[0], results[1], args));
            }
            throw new TypeError(`Promise chain rejection: Attempted to call ${results[0]}` +
                ' which is not a function.');
        }));
    },
    construct: function (target, args) {
        return wrap(target().then(function (result) {
            return wrap(Reflect.construct(result, args));
        }));
    }
};
Object.getOwnPropertyNames(Reflect).forEach(function (handler) {
    handlers[handler] = handlers[handler] || function (target, ...args) {
        return Reflect[handler](target(), ...args);
    };
});
//# sourceMappingURL=wrap.js.map