"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const Task_1 = require("./async/Task");
const MatchRegistry_1 = require("./MatchRegistry");
const load_1 = require("./load");
class FilterRegistry extends MatchRegistry_1.default {
    register(test, value, first) {
        let entryTest;
        const inTest = test;
        if (typeof inTest === 'string') {
            entryTest = (response, url, options) => {
                return inTest === url;
            };
        }
        else if (inTest instanceof RegExp) {
            entryTest = (response, url, options) => {
                return inTest.test(url);
            };
        }
        else {
            entryTest = inTest;
        }
        return super.register(entryTest, value, first);
    }
}
exports.FilterRegistry = FilterRegistry;
let defaultProvider = './request/xhr';
if (has_1.default('host-node')) {
    defaultProvider = './request/node';
}
class ProviderRegistry extends MatchRegistry_1.default {
    constructor() {
        super();
        const deferRequest = (url, options) => {
            let canceled = false;
            let actualResponse;
            return new Task_1.default((resolve, reject) => {
                this._providerPromise.then(function (provider) {
                    if (canceled) {
                        return;
                    }
                    if (provider) {
                        actualResponse = provider(url, options);
                        actualResponse.then(resolve, reject);
                    }
                });
            }, function () {
                if (!canceled) {
                    canceled = true;
                }
                if (actualResponse) {
                    actualResponse.cancel();
                }
            });
        };
        this._defaultValue = (url, options) => {
            this._providerPromise = load_1.default(require, defaultProvider).then(([providerModule]) => {
                this._defaultValue = providerModule.default;
                return providerModule.default;
            });
            this._defaultValue = deferRequest;
            return deferRequest(url, options);
        };
    }
    register(test, value, first) {
        let entryTest;
        if (typeof test === 'string') {
            entryTest = (url, options) => {
                return test === url;
            };
        }
        else if (test instanceof RegExp) {
            entryTest = (url, options) => {
                return test ? test.test(url) : null;
            };
        }
        else {
            entryTest = test;
        }
        return super.register(entryTest, value, first);
    }
}
exports.ProviderRegistry = ProviderRegistry;
exports.filterRegistry = new FilterRegistry(function (response) {
    return response;
});
exports.providerRegistry = new ProviderRegistry();
const request = function request(url, options = {}) {
    const promise = exports.providerRegistry.match(url, options)(url, options)
        .then(function (response) {
        return Task_1.default.resolve(exports.filterRegistry.match(response, url, options)(response, url, options))
            .then(function (filterResponse) {
            response.data = filterResponse.data;
            return response;
        });
    });
    return promise;
};
['DELETE', 'GET', 'POST', 'PUT'].forEach(function (method) {
    request[method.toLowerCase()] = function (url, options = {}) {
        options = Object.create(options);
        options.method = method;
        return request(url, options);
    };
});
exports.default = request;
//# sourceMappingURL=request.js.map