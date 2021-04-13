"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const util_1 = require("./util");
exports.isPlugin = util_1.isPlugin;
exports.useDefault = util_1.useDefault;
function resolveRelative(base, mid) {
    const isRelative = mid.match(/^\.+\//);
    let result = base;
    if (isRelative) {
        if (mid.match(/^\.\//)) {
            mid = mid.replace(/\.\//, '');
        }
        const up = mid.match(/\.\.\//g);
        if (up) {
            const chunks = base.split('/');
            if (up.length > chunks.length) {
                throw new Error('Path cannot go beyond root directory.');
            }
            chunks.splice(chunks.length - up.length);
            result = chunks.join('/');
            mid = mid.replace(/\.\.\//g, '');
        }
        mid = result + '/' + mid;
    }
    return mid;
}
function getBasePath(context) {
    return context()
        .split('/')
        .slice(0, -1)
        .join('/');
}
function load(...args) {
    const req = __webpack_require__;
    const context = typeof args[0] === 'function'
        ? args[0]
        : function () {
            return '';
        };
    const modules = __modules__ || {};
    const base = getBasePath(context);
    const results = args
        .filter((mid) => typeof mid === 'string')
        .map((mid) => resolveRelative(base, mid))
        .map((mid) => {
        let [moduleId, pluginResourceId] = mid.split('!');
        const moduleMeta = modules[mid] || modules[moduleId];
        if (!moduleMeta) {
            return Promise_1.default.reject(new Error(`Missing module: ${mid}`));
        }
        if (moduleMeta.lazy) {
            return new Promise_1.default((resolve) => req(moduleMeta.id)(resolve));
        }
        const module = req(moduleMeta.id);
        const defaultExport = module['default'] || module;
        if (util_1.isPlugin(defaultExport)) {
            pluginResourceId =
                typeof defaultExport.normalize === 'function'
                    ? defaultExport.normalize(pluginResourceId, (mid) => resolveRelative(base, mid))
                    : resolveRelative(base, pluginResourceId);
            return Promise_1.default.resolve(defaultExport.load(pluginResourceId, load));
        }
        return Promise_1.default.resolve(module);
    });
    return Promise_1.default.all(results);
}
exports.default = load;
//# sourceMappingURL=webpack.js.map