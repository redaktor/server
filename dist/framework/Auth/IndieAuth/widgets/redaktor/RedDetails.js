"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
function _textContent(children) {
    return children.filter((child) => typeof child === 'string');
}
function textContent(nodeOrChildren) {
    let results = [];
    if (typeof nodeOrChildren === 'string') {
        results.push(nodeOrChildren);
    }
    else if (Array.isArray(nodeOrChildren)) {
    }
    else if (typeof nodeOrChildren === 'object') {
    }
    return results.join('');
}
class MfDetails extends WidgetBase_1.default {
    render() {
        console.log('MfDetails', this.properties);
        let { icon, title = '', summary = false, summaryTag = 'div.strong.summary.blue.text', baseTag = 'label.ui.details' } = this.properties;
        if (!!icon && !!icon.length) {
            icon += ' icon';
        }
        if (typeof summary !== 'string') {
            console.log('this.children', this.children);
            console.log('textContent', this.children.filter((child) => typeof child === 'string'));
            summary = 'TEST';
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
//# sourceMappingURL=RedDetails.js.map