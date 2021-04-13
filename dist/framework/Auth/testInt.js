"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const i18n_1 = require("@dojo/framework/i18n");
const flickr_1 = require("./authProviders/flickr");
i18n_1.default(flickr_1.default, 'de').then((locales) => {
    console.log(locales);
}, (e) => {
    util_1.dumpError(e);
});
//# sourceMappingURL=testInt.js.map