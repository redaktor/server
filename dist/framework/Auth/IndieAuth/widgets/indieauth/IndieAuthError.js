"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
class Error extends WidgetBase_1.default {
    render() {
        const { me = {}, client_id = {}, statusCode = 0 } = this.properties;
        const containerStr = 'div.ui.container.meContainer';
        if (statusCode === 0) {
            return d_1.v(containerStr, [
                d_1.v('h5.red.text', ['{{error}}, {{noRes}}.']),
                d_1.v('p.red.text', ['{{statusMessage}}'])
            ]);
        }
        else if (me.statusCode !== 200) {
            return d_1.v(containerStr, [
                d_1.v('h5.red.text', ['{{noRes}}']),
                d_1.v('p.red.text', ['{{me.statusCode}} ', '– {{me.statusMessage|safe}}'])
            ]);
        }
        else {
            return d_1.v(containerStr, [
                d_1.v('h5.red.text', ['{{unknown}}']),
                d_1.v('p.red.text', ['{{me.statusCode}} ', '– {{me.statusMessage|safe}}'])
            ]);
        }
    }
}
exports.default = Error;
//# sourceMappingURL=IndieAuthError.js.map