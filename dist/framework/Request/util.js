"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UrlSearchParams_1 = require("./UrlSearchParams");
function createHandle(destructor) {
    let called = false;
    return {
        destroy: function () {
            if (!called) {
                called = true;
                destructor();
            }
        }
    };
}
exports.createHandle = createHandle;
function createCompositeHandle(...handles) {
    return createHandle(function () {
        for (let i = 0; i < handles.length; i++) {
            handles[i].destroy();
        }
    });
}
exports.createCompositeHandle = createCompositeHandle;
function generateRequestUrl(url, options = {}) {
    let query = new UrlSearchParams_1.default(options.query).toString();
    if (options.cacheBust) {
        const bustString = String(Date.now());
        query += query ? `&${bustString}` : bustString;
    }
    const separator = url.indexOf('?') > -1 ? '&' : '?';
    return query ? `${url}${separator}${query}` : url;
}
exports.generateRequestUrl = generateRequestUrl;
function getStringFromFormData(formData) {
    const fields = [];
    for (const key of formData.keys()) {
        fields.push(encodeURIComponent(key) + '=' + encodeURIComponent(formData.get(key)));
    }
    return fields.join('&');
}
exports.getStringFromFormData = getStringFromFormData;
//# sourceMappingURL=util.js.map