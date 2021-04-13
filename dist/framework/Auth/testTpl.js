"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
var auth = new _1.default({ debug: true });
auth.get({ url: 'https://indieweb.org/Events', responseType: 'mf' }).then((res) => {
    console.log(JSON.stringify(res.data));
});
//# sourceMappingURL=testTpl.js.map