"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locales = {
    de: () => Promise.resolve().then(() => require('./de'))
};
const provider = {
    id: 'authorization_endpoint',
    title: 'Personal authorization endpoint',
    description: 'Your personal Authorization Endpoint.',
    setup: {
        instructions: 'Please note: Open the developer page',
        key: '',
        secret: '',
        url: 'https://indieweb.org/authorization-endpoint'
    },
    svg: '<circle fill="#3E373C" cx="224" cy="224" r="224"/> <circle fill="#95cc0d" cx="224" cy="224" r="204"/>' +
        '<g><rect x="128.163" y="121.529" fill="#FF0000" width="191.674" height="53.65"/>' +
        '<rect x="128.163" y="194.753" fill="#FF0000" width="191.674" height="116.747"/></g>'
};
exports.default = { locales, provider };
//# sourceMappingURL=index.js.map