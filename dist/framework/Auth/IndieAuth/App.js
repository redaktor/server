"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("@dojo/framework/widget-core/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
const IndieAuthProgress_1 = require("./widgets/indieauth/IndieAuthProgress");
const IndieAuthLogin_1 = require("./widgets/indieauth/IndieAuthLogin");
const IndieAuthContainer_1 = require("./widgets/indieauth/IndieAuthContainer");
class App extends WidgetBase_1.WidgetBase {
    render() {
        const providers = this.properties.me.data.best.providers;
        let w_IndieAuth = this.properties.me.statusCode < 0 ? IndieAuthLogin_1.default : IndieAuthContainer_1.default;
        return d_1.v('div', [
            d_1.w(IndieAuthProgress_1.default, { providers: Object.keys(providers).map(k => {
                    return { valid: providers[k].valid, url: providers[k].url };
                }) }),
            d_1.w(w_IndieAuth, this.properties)
        ]);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map