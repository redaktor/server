"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
const uuid_1 = require("../../../../../dojo/core/uuid");
const RedImage_1 = require("../redaktor/RedImage");
const RedUrl_1 = require("../redaktor/RedUrl");
class SiteInfo extends WidgetBase_1.default {
    render() {
        let o = this.properties;
        if (!(o) || typeof o != 'object' || (!(o.best) && !(o.url))) {
            o = { best: {}, url: '' };
        }
        const t = o.best.title;
        const infoChildren = [];
        if (!!(o.best.icon)) {
            infoChildren.push(d_1.w(RedImage_1.default, { src: o.best.icon, class: 'icon', key: uuid_1.default() }));
            infoChildren.push('  ');
        }
        (!!(o.url) && infoChildren.push(d_1.w(RedUrl_1.default, { href: o.url, title: t, target: '_blank' })));
        return d_1.v('span', infoChildren);
    }
}
exports.default = SiteInfo;
//# sourceMappingURL=MfCardSiteInfo.js.map