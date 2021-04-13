"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
const RedUrl_1 = require("../redaktor/RedUrl");
const util_1 = require("./util");
class NameHeader extends WidgetBase_1.default {
    render() {
        const nps = ['honorific-prefix', 'given-name', 'additional-name', 'family-name', 'honorific-suffix'];
        const { url, name, org, nickname, isOrg = false } = this.properties;
        let type;
        const p = this.properties;
        const children = [];
        if (Array.isArray(url) && url.length === 1 && !!name) {
            children.push(d_1.w(RedUrl_1.default, {
                href: url[0],
                class: 'p-name u-url fn url right floated',
                target: '_blank',
                title: 'name',
                style: 'max-width: calc(100% - 2.7rem - 1em);'
            }, [(Array.isArray(name) && !!name.length) ? name[0] : url[0]]));
        }
        else if (!isOrg && Array.isArray(name)) {
            children.push(d_1.v('span.p-name', name));
        }
        else if (p[nps[0]] || p[nps[1]] || p[nps[2]] || p[nps[3]] || p[nps[4]]) {
            nps.forEach((type) => children.push(util_1.u_pExplode(type, p)));
        }
        else {
            type = 'org';
            children.push(d_1.v('span.p-org.org.grey.text', [!!(p.org) ? p.org[0] : 'Name']));
        }
        if (type !== 'org' && Array.isArray(p.org) && p.org.length === 1 && typeof p.org[0] === 'string') {
            children.push(d_1.v('span.p-org.org.grey.text', [p.org[0]]));
        }
        return d_1.v('h3.header', children);
    }
}
exports.default = NameHeader;
//# sourceMappingURL=MfCardNameHeader.js.map