"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_1 = require("../../JSON/clone");
const Patch_1 = require("../../JSON/Patch");
var OP;
(function (OP) {
    OP["ADD"] = "add";
    OP["REMOVE"] = "remove";
    OP["REPLACE"] = "replace";
    OP["TEST"] = "test";
})(OP = exports.OP || (exports.OP = {}));
function JSONvalue(v) { return typeof v === 'undefined' ? null : v; }
exports.JSONvalue = JSONvalue;
function exec(parts, modules) {
    let targetIndex;
    const patches = parts.reduce((a, p, i) => {
        if (!!p.basePath) {
            const args = !!p.args ? p.args :
                (!!i && parts[i - 1].patch.hasOwnProperty('value') ? [parts[i - 1].patch.value] : []);
            p.target = Reflect.construct(modules[i].default, args);
            targetIndex = i;
            if (!!p.target) {
                p.patch.value = { value: p.target.value };
            }
        }
        else {
            let fn, fnTarget;
            if (!p.patch.path) {
                p.patch.path = `${parts[targetIndex].patch.path}/${p.path}`;
            }
            if (Reflect.has(parts[targetIndex].target, p.prop)) {
                fnTarget = parts[targetIndex].target;
                fn = Reflect.get(fnTarget, p.prop);
                console.log('__', fn);
                p.targetIndex = targetIndex;
            }
            else {
                for (var j = targetIndex - 1; j > -1; j--) {
                    if (parts[j].hasOwnProperty('target') && Reflect.has(parts[j].target, p.prop)) {
                        fnTarget = parts[j].target;
                        fn = Reflect.get(fnTarget, p.prop);
                        p.targetIndex = j;
                        break;
                    }
                }
            }
            if (!!fn) {
                p.patch.value = clone_1.default(p.args ? Reflect.apply(fn, fnTarget, p.args) : fn, true);
            }
        }
        if (p.patch.hasOwnProperty('value') && typeof p.patch.value !== 'undefined') {
            a.push(p.patch);
        }
        return a;
    }, []);
    console.log('PATCHES', patches);
    const o = new Patch_1.default({});
    console.log('RESULT:::', o.apply(patches));
    return patches;
}
function fluent(registry, terminators = {}, executor = exec, ctx = null) {
    let parts = [];
    let cur = {};
    const proxy = new Proxy(function (...args) {
        if (typeof terminators[cur.action] === 'function') {
            const basePath = terminators[cur.action].call(ctx, parts, cur, args);
            if (typeof basePath === 'string') {
                cur.basePath = basePath;
            }
            return proxy;
        }
        else if (!!args.length) {
            console.log('args', cur.action, args);
            parts[parts.length - 1].args = args;
            return proxy;
        }
        const LOAD = parts.reduce((a, p, i) => {
            if (!!p.basePath) {
                a.push(Promise.resolve().then(() => require(`.${p.basePath}`)));
                parts[i].targetIndex = i;
            }
            return a;
        }, []);
        console.log('loading', LOAD);
        return Promise.all(LOAD).then((modules) => {
            const returnVal = executor.call(ctx, parts, modules);
            parts = [];
            console.log('returnVal', returnVal, returnVal.then);
            return returnVal;
        });
    }, {
        has() { return true; },
        get(target, prop) {
            console.log(prop, typeof prop);
            const part = { prop, patch: {} };
            cur.action = prop;
            if (!!terminators[prop]) {
                return proxy;
            }
            if (!!registry[prop]) {
                cur = registry[prop];
                part.patch.op = OP.ADD;
                part.basePath = cur.basePath;
                console.log('evt. LOAD // new', part);
            }
            else {
                const isSpec = (!!cur.specOps && cur.specOps[prop]);
                part.patch.op = isSpec ? cur.specOps[prop] : OP.ADD;
                part.path = `${isSpec ? prop : 'value'}`;
                console.log('op', part);
            }
            parts.push(part);
            return proxy;
        }
    });
    return proxy;
}
const testRegistry = {
    array: {
        basePath: '/Array',
        specOps: { count: OP.ADD }
    },
    thing: {
        basePath: '/Thing'
    }
};
const JSON_PATCH_TERMINATORS = {
    as: (parts, current, args) => {
        const L = parts.length;
        const LAST = !!L && parts[L - 1];
        if (!!LAST && !!args.length) {
            if (LAST.hasOwnProperty('basePath')) {
                LAST.patch.path = (args[0].charAt(0) === '/') ? args[0] : `/${args[0]}`;
                return LAST.patch.path;
            }
            LAST.patch.path = (args[0].charAt(0) === '/') ? args[0] : `${current.basePath}/${args[0]}`;
        }
    }
};
const r = fluent(testRegistry, JSON_PATCH_TERMINATORS, exec);
r.array([1, false, 2]).as('Users').pushIt(3).as('allCurrentUsers').filter((v) => !!v).count.do().then((x) => {
    console.log('');
    console.log(':::');
    console.log(x);
});
//# sourceMappingURL=main.js.map