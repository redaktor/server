"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pointer_1 = require("../JSON/Pointer");
const wrap_1 = require("./wrap");
let _proxy;
let _state = new WeakMap();
class API {
    constructor(_input = {}, _options = {}, ...args) {
        this._input = _input;
        this._options = _options;
        this.pointer = Pointer_1.default;
        this.isA = 'API';
        _state.set(this, { parent: args[0], result: { value: _input }, _last: 'value' });
        console.log('API input', _input);
    }
    init(o) {
        if (!!o.awaits && typeof o.awaits === 'object') {
            for (let k in o.awaits) {
                this[k] = this.fn([o.awaits[k], k]);
            }
        }
        _proxy = (!!o.proxyHandler && typeof o.proxyHandler === 'object') ?
            new Proxy(this, o.proxyHandler) : false;
        return _proxy || this;
    }
    get options() { return this._options; }
    set options(o) { this._options = o; }
    get value() {
        const o = _state.get(this);
        return o.result[o._last];
    }
    get parent() { return (_state.get(this) || { parent: {} }).parent; }
    async $load(m) { return (await Promise.resolve().then(() => require(`./base/${m}`))); }
    async $fn(m, ...args) {
        const [M, F] = typeof m === 'string' ? [m, 'default'] : m;
        const fns = await this.$load(M);
        const o = _state.get(this);
        o.result[F] = fns[F](o.result[o._last], ...args);
        o._last = F;
        _state.set(this, o);
        return _proxy || this;
    }
    fn(m) {
        return (...args) => API._(this.$fn(m, ...args));
    }
    static options(defaultOptions = {}) {
        return function classDecorator(constructor) {
            console.log('::', Object.getOwnPropertyNames(constructor), constructor);
            return class extends constructor {
                constructor(...args) {
                    super(...args);
                    this.isA = constructor.name;
                    this.options = Object.assign(Object.assign({}, defaultOptions), args[0]);
                }
            };
        };
    }
}
exports.default = API;
API._ = wrap_1.default;
//# sourceMappingURL=index.js.map