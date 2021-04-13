"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
const components_1 = require("../../../../Template/components");
const RedSvg_1 = require("../redaktor/RedSvg");
class Providers extends WidgetBase_1.default {
    render() {
        const { me = {}, client_id = {}, headerNote = '', js = '', notSupported = '', date = '' } = this.properties;
        const providers = me.data.best.providers;
        const vColors = ['', 'green', 'green', 'orange', 'red', 'blue'];
        console.log('PROVIDERS0', Object.keys(providers));
        return d_1.v('section.ui.column.stackable.grid#auth', [
            d_1.v('article.sixteen.wide.column', [
                d_1.v('h4.ui.top.spaced.horizontal.header.green.divider.statusdivider', [
                    d_1.v('small', [headerNote])
                ]),
                d_1.v('noscript', [
                    d_1.v('div.ui.tiny.bordered.raised.segment', [d_1.v('h2.red.text', [js])])
                ])
            ]),
            d_1.v('span.sixteen.wide.column.indieauth.grid', Object.keys(providers).map((k) => {
                const p = providers[k];
                console.log('PROVIDERS', k, p);
                const isP = (!!p.valid && p.key);
                const isA = (!!isP && p.key === 'authorization_endpoint');
                const order = !!p.order ? p.order : (!!isP ? 4 : 5);
                const btnCl = ((order > 3) ? '.disabled.' : '.') + vColors[order];
                const vNode = `output.indieauth.${isP ? 'provider' : 'link'}`;
                return d_1.v(vNode, components_1.dataset({ order: order, url: p.url, provider: p.key, title: p.title }), [
                    d_1.v(`button.ui.large${btnCl}.button`, [
                        d_1.v('div.ui.horizontal.segments', [
                            d_1.v('div.ui.segment.site', (!!isP ? [
                                d_1.v('div.ui.mini.image', { title: `${p.title}:${p.description}` }, [
                                    d_1.w(RedSvg_1.default, { svg: p.svg })
                                ]),
                                d_1.v('span', ['  ', p.display || '?'])
                            ] :
                                [
                                    d_1.v('p.meta.blue.text', [d_1.v('i.minus.icon'), ' ' + notSupported]),
                                    (!p.display) ? '' : p.display
                                ])),
                            (!isP) ? '' : d_1.v('div.ui.inverted.segment.active.dimmer', [
                                d_1.v('div.ui.indeterminate.loader', [d_1.v('i.exchange.icon.blue.text')])
                            ])
                        ])
                    ])
                ]);
            }).concat(d_1.v('div.ui.center.aligned.grey.inverted.segment.indieauth.link', [
                d_1.v('p.serif.italic', [
                    d_1.v('time', { title: date, datetime: date }, [date])
                ])
            ])))
        ]);
    }
}
exports.default = Providers;
//# sourceMappingURL=IndieAuthProviders.js.map