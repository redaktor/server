"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterator_1 = require("@dojo/framework/shim/iterator");
function isPlugin(value) {
    return Boolean(value) && typeof value.load === 'function';
}
exports.isPlugin = isPlugin;
function useDefault(modules) {
    if (iterator_1.isArrayLike(modules)) {
        let processedModules = [];
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            processedModules.push(module.__esModule && module.default ? module.default : module);
        }
        return processedModules;
    }
    else if (iterator_1.isIterable(modules)) {
        let processedModules = [];
        for (const module of modules) {
            processedModules.push(module.__esModule && module.default ? module.default : module);
        }
        return processedModules;
    }
    else {
        return modules.__esModule && modules.default ? modules.default : modules;
    }
}
exports.useDefault = useDefault;
//# sourceMappingURL=util.js.map