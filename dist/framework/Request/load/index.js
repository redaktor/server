"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const util_1 = require("./load/util");
exports.isPlugin = util_1.isPlugin;
exports.useDefault = util_1.useDefault;
function isAmdRequire(object) {
    return typeof object.toUrl === 'function';
}
exports.isAmdRequire = isAmdRequire;
function isNodeRequire(object) {
    return typeof object.resolve === 'function';
}
exports.isNodeRequire = isNodeRequire;
const load = (function () {
    const resolver = isAmdRequire(require)
        ? require.toUrl
        : isNodeRequire(require) ? require.resolve : (resourceId) => resourceId;
    function pluginLoad(moduleIds, load, loader) {
        const pluginResourceIds = [];
        moduleIds = moduleIds.map((id, i) => {
            const parts = id.split('!');
            pluginResourceIds[i] = parts[1];
            return parts[0];
        });
        return loader(moduleIds).then((modules) => {
            pluginResourceIds.forEach((resourceId, i) => {
                if (typeof resourceId === 'string') {
                    const module = modules[i];
                    const defaultExport = module['default'] || module;
                    if (util_1.isPlugin(defaultExport)) {
                        resourceId =
                            typeof defaultExport.normalize === 'function'
                                ? defaultExport.normalize(resourceId, resolver)
                                : resolver(resourceId);
                        modules[i] = defaultExport.load(resourceId, load);
                    }
                }
            });
            return Promise_1.default.all(modules);
        });
    }
    if (typeof module === 'object' && typeof module.exports === 'object') {
        return function load(contextualRequire, ...moduleIds) {
            if (typeof contextualRequire === 'string') {
                moduleIds.unshift(contextualRequire);
                contextualRequire = require;
            }
            return pluginLoad(moduleIds, load, (moduleIds) => {
                try {
                    return Promise_1.default.resolve(moduleIds.map(function (moduleId) {
                        return contextualRequire(moduleId.split('!')[0]);
                    }));
                }
                catch (error) {
                    return Promise_1.default.reject(error);
                }
            });
        };
    }
    else if (typeof define === 'function' && define.amd) {
        return function load(contextualRequire, ...moduleIds) {
            if (typeof contextualRequire === 'string') {
                moduleIds.unshift(contextualRequire);
                contextualRequire = require;
            }
            return pluginLoad(moduleIds, load, (moduleIds) => {
                return new Promise_1.default(function (resolve, reject) {
                    let errorHandle;
                    if (typeof contextualRequire.on === 'function') {
                        errorHandle = contextualRequire.on('error', (error) => {
                            errorHandle.remove();
                            reject(error);
                        });
                    }
                    contextualRequire(moduleIds, function (...modules) {
                        errorHandle && errorHandle.remove();
                        resolve(modules);
                    });
                });
            });
        };
    }
    else {
        return function () {
            return Promise_1.default.reject(new Error('Unknown loader'));
        };
    }
})();
exports.default = load;
//# sourceMappingURL=index.js.map