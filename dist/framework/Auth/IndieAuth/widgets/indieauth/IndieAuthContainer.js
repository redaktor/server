"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WidgetBase_1 = require("../../../../webcomponents/WidgetBase");
const d_1 = require("@dojo/framework/widget-core/d");
const main_1 = require("../../../../../dojo/core/main");
const uuid_1 = require("../../../../../dojo/core/uuid");
const MfCardSiteInfo_1 = require("../microformats/MfCardSiteInfo");
const MfCard_1 = require("../microformats/MfCard");
const IndieAuthError_1 = require("./IndieAuthError");
const IndieAuthProviders_1 = require("./IndieAuthProviders");
class Container extends WidgetBase_1.default {
    render() {
        const { me = {}, client_id = {}, statusCode = 0, _as = 'as', _to = 'to', mfs = '', error = '', cardHeader = '' } = this.properties;
        const providers = me.data.best.providers;
        let mfLabel = d_1.v('h5.summary.grey.text', [
            d_1.v('img.ui.mini.image', { src: 'img/logoMicroformats.svg' }, [
                '&nbsp;  ',
                d_1.v('small.grey.serif.text', [d_1.v('em', [mfs])])
            ])
        ]);
        let steps = {
            as: [
                (!me.data ? '' :
                    d_1.v('output.me.site.title', { 'data-ref': me.data.url }, [
                        d_1.w(MfCardSiteInfo_1.default, main_1.lang.mixin(me.data, { key: uuid_1.default() }))
                    ])),
                ((!me.data.best.hCard) ? '' :
                    d_1.v('output.left.aligned.container', {
                        'data-ref': `${me.data.url}#${me.data.best.hCard['$ref']}`
                    }, [
                        d_1.v('div.mf.description', [
                            d_1.v('label.ui.details', [
                                d_1.v('input', { type: 'checkbox' }),
                                mfLabel,
                                d_1.w(MfCard_1.default, {
                                    locale: 'de',
                                    card: me.data.best.hCard.properties,
                                    type: me.data.best.hCard.type,
                                    representative: me.data.best.hCard.representative,
                                    key: uuid_1.default()
                                }, me.data.best.hCard.children || [])
                            ])
                        ])
                    ]))
            ],
            to: [
                (!client_id.data ? '' :
                    d_1.v('output.client_id.site.title', { 'data-ref': client_id.data.url }, [
                        d_1.w(MfCardSiteInfo_1.default, main_1.lang.mixin(client_id.data, { key: uuid_1.default() }))
                    ])),
                ((!client_id.data.best.hXApp) ? '' :
                    d_1.v('output.left.aligned.container', {
                        'data-ref': `${client_id.data.url}#${client_id.data.best.hXApp['$ref']}`
                    }, [
                        d_1.v('div.mf.description', [
                            d_1.v('label.ui.details', [
                                d_1.v('input', { type: 'checkbox' }),
                                mfLabel,
                                d_1.w(MfCard_1.default, {
                                    locale: 'de',
                                    card: client_id.data.best.hXApp.properties,
                                    type: client_id.data.best.hXApp.type,
                                    representative: client_id.data.best.hXApp.representative,
                                    key: uuid_1.default()
                                }, client_id.data.best.hXApp.children || [])
                            ])
                        ])
                    ]))
            ]
        };
        const meError = ((me.statusCode !== 200 || !me.data.best) && [
            d_1.v('b.ui.top.left.attached.label.red.large', ['“me”', error]),
            d_1.w(IndieAuthError_1.default, this.properties)
        ]);
        return d_1.v('div.ui.inverted.vertical.grey.segment', [
            d_1.v('div.ui.text.container', [
                d_1.v('div.ui.top.green.label.signin', [d_1.v('b', [cardHeader])]),
                d_1.v('div.ui.two.steps', [
                    d_1.v('div.step.as', (!!meError ? meError : [
                        d_1.v('b.ui.top.left.attached.green.label', [_as]),
                        d_1.v('div.ui.container.meContainer', steps.as)
                    ])),
                    d_1.v('div.step.to', [
                        d_1.v('b.ui.top.right.attached.green.label', [_to]),
                        d_1.v('div.ui.container.clientIdContainer', steps.to)
                    ])
                ]),
                d_1.w(IndieAuthProviders_1.default, this.properties)
            ])
        ]);
    }
}
exports.default = Container;
//# sourceMappingURL=IndieAuthContainer.js.map