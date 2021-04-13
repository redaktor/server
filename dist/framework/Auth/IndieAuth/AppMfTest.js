"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../webcomponents/WidgetBase");
const uuid_1 = require("../../../dojo/core/uuid");
const d_1 = require("@dojo/framework/widget-core/d");
const Card_1 = require("../../webcomponents/redaktor/card/Card");
class App extends WidgetBase_1.default {
    render() {
        const { me = {} } = this.properties;
        return d_1.v('div.ui.container', [
            d_1.v('div.ui.cards', [
                d_1.w(Card_1.default, {
                    locale: 'de',
                    description: 'TEST',
                    card: me.data.best.hCard.properties,
                    type: me.data.best.hCard.type,
                    representative: me.data.best.hCard.representative,
                    key: uuid_1.default()
                }, me.data.best.hCard.children || [])
            ])
        ]);
    }
}
exports.default = App;
//# sourceMappingURL=AppMfTest.js.map