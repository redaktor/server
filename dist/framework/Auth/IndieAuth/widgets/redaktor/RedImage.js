"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseInput_1 = require("../../../../../widgets/baseInput");
const d_1 = require("@dojo/framework/widget-core/d");
class Image extends baseInput_1.default {
    constructor() {
        super(...arguments);
        this.sizes = { mini: 1, tiny: 1, small: 1, medium: 1, large: 1, big: 1, huge: 1, massive: 1 };
        this.aligns = { top: 1, middle: 1, bottom: 1 };
    }
    render() {
        const { size = '', align = 'middle' } = this.properties;
        const sized = (!!this.sizes[size] ? ('.' + size) : '');
        const aligned = (!!this.aligns[align] ? '.' + align : '');
        return d_1.v(`img.ui.inline${aligned}.aligned${sized}.image`, this.properties);
    }
}
exports.default = Image;
//# sourceMappingURL=RedImage.js.map