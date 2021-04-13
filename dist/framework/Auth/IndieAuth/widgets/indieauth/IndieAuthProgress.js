"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
class Progress extends WidgetBase_1.default {
    render() {
        const { providers = [] } = this.properties;
        return d_1.v('div.ui.equal.width.grid.authProgress', providers.map((p) => {
            return d_1.v('output.ui.column', { 'data-ref': (p.valid) ? p.url : 'link' }, [d_1.v('div.ui.small.indicating.progress', [d_1.v('div.bar')])]);
        }));
    }
}
exports.default = Progress;
//# sourceMappingURL=IndieAuthProgress.js.map