"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const d_1 = require("@dojo/framework/widget-core/d");
const uuid_1 = require("../../../../../dojo/core/uuid");
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const util_1 = require("./util");
const svgs_1 = require("./svgs");
const MfCardRibbon_1 = require("./MfCardRibbon");
const MfCardNameHeader_1 = require("./MfCardNameHeader");
const RedImage_1 = require("../redaktor/RedImage");
const RedUrl_1 = require("../redaktor/RedUrl");
const RedDetails_1 = require("../redaktor/RedDetails");
const common_1 = require("./nls/common");
class Card extends WidgetBase_1.default {
    hOrg(o, isSmall = false, isOrg = false) {
        if (!(o.org)) {
            return '';
        }
        const children = o.org.map((_org) => {
            if (_org.properties) {
                return d_1.w(Card, {
                    card: _org.properties,
                    locale: this.properties.locale,
                    type: 'h-org', isSmall: true, isOrg: true, key: uuid_1.default()
                });
            }
            else {
                return d_1.v('span.grey.italic.serif.text.p-org', [_org]);
            }
        });
        return d_1.v('div.p-org.org.extra.content', children);
    }
    avatar(o, isSmall = false, isOrg = false) {
        let Avatar = d_1.v('i.ui.user.icon.right.floated', {
            style: (!!isOrg) ? 'margin-left: 1.8rem;' : ''
        });
        if (Array.isArray(o.photo) || Array.isArray(o.logo)) {
            Avatar = d_1.w(RedImage_1.default, {
                key: uuid_1.default(),
                src: (!!(o.photo) ? o.photo[0] : o.logo[0]),
                size: 'mini',
                class: 'right floated'
            });
        }
        else if (!!(o.sex) && o.sex.toUpperCase() === 'M') {
            Avatar = d_1.v('div.right.floated', [svgs_1.monster]);
        }
        else if (!!(o.sex)) {
            Avatar = d_1.v('div.right.floated', [svgs_1.witch]);
        }
        return Avatar;
    }
    notes(o, isSmall = false, isOrg = false, caption = 'Notes') {
        let Notes = '';
        if (!!(o.note)) {
            const notes = util_1.u_pExplode('note', o, 'justified note small serif text', '', 'p');
            if (!!notes.length) {
                const summary = d_1.v('span', (!!notes[0].children.length) ?
                    [(notes[0].children[0].slice(0, 20) + ' …')] : [caption]);
                Notes = d_1.w(RedDetails_1.default, {
                    key: uuid_1.default(),
                    icon: 'idea',
                    title: caption,
                }, notes.concat([d_1.v('br')]));
            }
        }
        return Notes;
    }
    orgs(o, isSmall = false, isOrg = false, caption = 'Organisations') {
        let Orgs = '';
        const isArr = Array.isArray(o.org);
        if (!(o.org)) {
            return Orgs;
        }
        if (!(isArr && o.org.length === 1 && typeof o.org[0] === 'string')) {
            const orgContent = (this.hOrg(o, isSmall)) || ((!isOrg) ? 'priv.' : '');
            const orgP = { key: uuid_1.default(), icon: 'users', summary: caption, title: caption };
            Orgs = d_1.w(RedDetails_1.default, orgP, [orgContent, d_1.v('br')]);
        }
        return Orgs;
    }
    contact(o, isSmall = false, isOrg = false, captions) {
        if (!(o.tel) && !(o.email) && !(o.key) && !(o.impp)) {
            return '';
        }
        const contactTypes = [['p-tel', 'tel', 'call'], ['u-email', 'email', 'mail'],
            ['u-key', 'key', 'privacy'], ['u-impp', 'impp', 'talk']];
        const children = { summary: [], list: [] };
        let cl = '', item = '';
        contactTypes.forEach((c) => {
            if (o[c[1]]) {
                if (!Array.isArray(o[c[1]])) {
                    o[c[1]] = [o[c[1]]];
                }
                children.summary.push(d_1.v('i', { class: 'ui ' + c[2] + ' icon' }));
                children.summary.push(' ');
                o[c[1]].forEach((val, i) => {
                    cl = ((i > 0) ? [c[1], 'header'] : [c[0], c[1], 'header']).join(' ');
                    item = d_1.v('div.item', [
                        d_1.v('span', { class: cl }, [
                            d_1.v('i', { class: 'ui ' + c[2] + ' icon' }, [
                                (i > 0) ? d_1.w(RedUrl_1.default, {
                                    key: uuid_1.default(), href: val, class: ('contact ' + c[0]), title: c[1], target: '_blank'
                                }) : val
                            ]),
                            ' '
                        ])
                    ]);
                    children.list.push(item);
                });
            }
        });
        return d_1.v('div.extra.content.description', [
            d_1.v('label.ui.details', [
                d_1.v('input', { type: 'checkbox' }),
                d_1.v('span.summary.purple.text', children.summary),
                d_1.v('div.ui.list', children.list)
            ])
        ]);
    }
    address(o, isSmall = false, isOrg = false, captions) {
        const children = [];
        if (!!(o.adr)) {
            o.adr.forEach((adr) => {
                const myAddress = util_1.addressObj(adr);
                if (!(myAddress.summary)) {
                    children.push(d_1.w(RedDetails_1.default, {
                        key: uuid_1.default(),
                        summaryTag: 'span.summary.purple.text',
                        summary: d_1.v('div.ui.left.pointing.purple.basic.label', [
                            d_1.v('i.ui.marker.icon'), ' ', myAddress.summary
                        ])
                    }, [myAddress.details, d_1.v('br')]));
                }
                else {
                    children.push(...[d_1.v('i.ui.marker.icon'), ' ', myAddress.details]);
                }
            });
        }
        else {
        }
        return d_1.v('div.extra.content.description', children);
    }
    categories(o, isSmall = false, isOrg = false, caption = 'Categories') {
        if (!!(o.category)) {
            const cats = util_1.u_pExplode('category', o, 'ui tag label');
            return d_1.w(RedDetails_1.default, { key: uuid_1.default(), icon: 'tags', summary: caption, title: caption }, cats);
        }
        return '';
    }
    urls(o, isSmall = false, isOrg = false, caption = 'URLs') {
        if (!o.url || o.url.length < 2) {
            return '';
        }
        if (!!(o.url)) {
            const urls = util_1.u_pExplode('url', o, 'item', caption);
            console.log('urls', urls);
            return d_1.w(RedDetails_1.default, {
                key: uuid_1.default(), icon: 'linkify', summary: caption, title: caption
            }, [d_1.v('div.ui.narrow.list.urls', urls), d_1.v('div')]);
        }
        return '';
    }
    extra(o, p, title = '', icon = '', isDT = false) {
        console.log('extra', title);
        if (icon !== '') {
            icon = d_1.v('i.ui.' + icon + '.icon');
        }
        const cl = (icon !== '') ? '' : 'header';
        const content = (!!isDT) ? util_1.dtExplode(p, o, cl, title) : util_1.u_pExplode(p, o, cl, title);
        content.push(d_1.v('br'));
        const eChildren = [icon, d_1.v('small.meta', [title]), ' '].concat(content);
        return d_1.v('span', eChildren);
    }
    extras(o, isSmall = false, isOrg = false, messages) {
        let Extras = '';
        const eO = {
            bday: [messages.bday, 'birthday', true],
            anniversary: [messages.anniversary, 'birthday', true],
            tz: [messages.tz, 'wait'],
            callsign: [messages.callsign, 'sound'],
            role: [messages.role, 'spy'],
            'job-title': [messages.jobTitle, 'spy']
        };
        const eChildren = [];
        let key;
        for (key in eO) {
            if (!!(o[key])) {
                eChildren.push(this.extra.apply(this, [o, key].concat(eO[key])));
            }
        }
        if (!!(o.responses)) {
            const responses = util_1.u_pExplode('responses', o, 'small note meta serif text');
            eChildren.push(d_1.w(RedDetails_1.default, {
                key: uuid_1.default(),
                summaryTag: 'small',
                summary: messages.res,
                title: messages.res,
                icon: 'comments outline'
            }, responses));
        }
        return d_1.v('div.extra.content.cardExtra', eChildren);
    }
    render() {
        const messages = this.localizeBundle(common_1.default);
        const { representative = false, isSmall = false, isOrg = false, type = [''] } = this.properties;
        const o = (!!this.properties.card) ? this.properties.card : this.properties;
        const ribbonLabel = (!!representative) ? messages.representative : ' ';
        let Children = [];
        if (!!(this.children) && !!this.children.length) {
            Children.push(d_1.v('div.extra.content', [d_1.v('i.child.icon')].concat(this.children.reduce((a, c) => {
                if (c.value) {
                    a.push(d_1.v('small', [c.value]));
                }
                a.push(d_1.v('br'));
                a.push(d_1.w(Card, {
                    card: c.properties,
                    locale: this.properties.locale,
                    type: c.type,
                    key: uuid_1.default()
                }, c.children || []));
                return a;
            }, []))));
        }
        return d_1.v('div.ui.fluid.card', [
            d_1.w(MfCardRibbon_1.default, { label: (ribbonLabel + ' ' + type), success: representative, key: uuid_1.default() }),
            d_1.v('div.content', [
                this.avatar(o, isSmall, isOrg),
                d_1.w(MfCardNameHeader_1.default, o),
                this.notes(o, isSmall, isOrg, messages.note),
                this.orgs(o, isSmall, isOrg, messages.org),
                this.contact(o, isSmall, isOrg, messages),
                this.address(o, isSmall, isOrg, messages),
                this.categories(o, isSmall, isOrg, messages.cat),
                this.urls(o, isSmall, isOrg, messages.url),
                this.extras(o, isSmall, isOrg, messages)
            ]),
            d_1.v('div.extra.content', Children)
        ]);
    }
}
exports.default = Card;
//# sourceMappingURL=MfCard.js.map