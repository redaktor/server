"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
class Ribbon extends WidgetBase_1.default {
    render() {
        let { label = '', success = false, size = 'medium', align = 'right' } = this.properties;
        const color = this.properties.color || (!!success) ? 'green' : 'grey';
        const aligned = '.' + align;
        const children = (!!success ? [d_1.v('i.ui.checkmark.box.icon')] : []);
        if (!!success) {
            if (Array.isArray(label)) {
                label = (label.join(', ') + ' ');
            }
            children.push(d_1.v('', [' ' + label]));
        }
        return d_1.v(`div.ui.${color}${aligned}.ribbon.label`, this.properties, children);
    }
}
exports.default = Ribbon;
//# sourceMappingURL=MfCardRibbon.js.map