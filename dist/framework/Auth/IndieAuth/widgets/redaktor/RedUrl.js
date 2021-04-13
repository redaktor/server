"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseInput_1 = require("../../../../../widgets/baseInput");
const main_1 = require("../../../../../dojo/core/main");
const d_1 = require("@dojo/framework/widget-core/d");
class Url extends baseInput_1.default {
    render() {
        const { href = '#', target = '_self', rel = 'nofollow', } = this.properties;
        let children = (!this.children.length) ? [href] : [...this.children];
        return d_1.v('a.item', main_1.lang.mixin({ rel, target, href }, this.properties), children);
    }
}
exports.default = Url;
//# sourceMappingURL=RedUrl.js.map