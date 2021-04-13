"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("@dojo/framework/widget-core/WidgetBase");
const Themeable_1 = require("@dojo/framework/widget-core/mixins/Themeable");
const d_1 = require("@dojo/framework/widget-core/d");
exports.DetailsBase = Themeable_1.ThemeableMixin(WidgetBase_1.WidgetBase);
class MfDetails extends exports.DetailsBase {
    render() {
        console.log('MfDetails', this.classes);
        const { icon, title = '', summary = '', summaryTag = 'div.strong.summary.blue.text', baseTag = 'label.ui.details' } = this.properties;
        let summaryChildren = (!!icon) ?
            [d_1.v('i', { class: icon }), ' ', summary] : [summary];
        const children = [
            d_1.v('input', { type: 'checkbox' }),
            d_1.v(summaryTag, summaryChildren)
        ];
        console.log(this.children);
        return d_1.v('div', { title }, [d_1.v(baseTag, children.concat(this.children))]);
    }
}
exports.default = MfDetails;
//# sourceMappingURL=Test.js.map