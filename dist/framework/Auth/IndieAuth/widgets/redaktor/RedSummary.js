"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
class MfDetails extends WidgetBase_1.default {
    render() {
        console.log('MfDetails', this.properties);
        let { icon, title = '', summary = '', summaryTag = 'div.strong.summary.blue.text', baseTag = 'label.ui.details' } = this.properties;
        if (!!icon && !!icon.length) {
            icon += ' icon';
        }
        let classes = (!!this.properties.summaryCount) ?
            'summarized' : (this.properties.class || 'default');
        console.log('classes', classes);
        let summaryChildren = (!!icon) ?
            [d_1.v('i', { class: icon }), ' ', summary] : [summary];
        const children = [
            d_1.v('input', { type: 'checkbox' }),
            d_1.v(summaryTag, summaryChildren)
        ];
        console.log(this.children);
        return d_1.v('div', { title }, [d_1.v(baseTag, { class: classes }, children.concat(this.children))]);
    }
}
exports.default = MfDetails;
//# sourceMappingURL=RedSummary.js.map