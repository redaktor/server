"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locales = {
    de: () => Promise.resolve().then(() => require('./de'))
};
const provider = {
    id: 'sms',
    title: 'SMS',
    authUrl: 'https://api.twilio.com/2010-04-01',
    description: 'Sign In with SMS.',
    setup: {
        instructions: 'Please note:\nSMS Auth is not an independent mechanism simply based on protocols.\n' +
            'Since it involves many SILO gateways we use the Twilio API.\nOpen the developer page',
        key: 'AccountSid or API Key Sid',
        secret: 'AuthToken or API Key Secret',
        url: 'https://www.twilio.com/console'
    },
    verify: {
        meta: { userId: '/aud' }
    },
    svg: '<circle fill="#3E373C" cx="224" cy="224" r="224"/> <circle fill="#95cc0d" cx="224" cy="224" r="204"/>' +
        '<g><rect x="128.163" y="121.529" fill="#FF0000" width="191.674" height="53.65"/>' +
        '<rect x="128.163" y="194.753" fill="#FF0000" width="191.674" height="116.747"/></g>'
};
exports.default = { locales, provider };
//# sourceMappingURL=index.js.map