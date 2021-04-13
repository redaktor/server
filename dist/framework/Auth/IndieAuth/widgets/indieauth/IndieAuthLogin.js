"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
class Login extends WidgetBase_1.default {
    render() {
        const { client_id = '/', placeholder = 'yourdomain.com' } = this.properties;
        return d_1.v('div.ui.authLogin', [
            d_1.v('h3.ui.orange.header', ['Enter your Web Address:']),
            d_1.v('form.ui.labeled.action.input', [
                d_1.v('div.ui.label', [d_1.v('i.orange.text.icon.linkify'), 'http://']),
                d_1.v('input', { type: 'text', name: 'me', placeholder: placeholder }),
                d_1.v('input', { type: 'hidden', name: 'client_id', value: client_id }),
                d_1.v('button.ui.green.button', { type: 'submit' }, ['Sign In'])
            ])
        ]);
    }
}
exports.default = Login;
//# sourceMappingURL=IndieAuthLogin.js.map