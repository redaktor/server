"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
class Svg extends WidgetBase_1.default {
    render() {
        const { x = '0px', y = '0px', width = '40px', height = '40px', viewBox = '0 0 448 448', svg } = this.properties;
        let children = (!!svg) ? [] : [...this.children];
        let mySVG = (!svg && !!children.length) ? children[0] : svg;
        let vNode = d_1.v('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            version: '1.1',
            x: x,
            y: y,
            width: width,
            height: height,
            viewBox: viewBox,
            'enable-background': ('new ' + viewBox),
            'xml:space': 'preserve',
            innerHTML: mySVG
        });
        return vNode;
    }
}
exports.default = Svg;
//# sourceMappingURL=RedSvg.js.map