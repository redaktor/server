"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ISO3166_1 = require("./ISO3166");
const ISO639_4 = require("./ISO639");
exports.militaryTime = /^([01]\d|2[0-3]):?([0-5]\d)$/;
exports.fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
exports.halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
exports.hexColor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
exports.hexadecimal = /^[0-9a-fA-F]+$/;
exports.mongoId = /^[0-9a-fA-F]+$/;
exports.multibyte = /[^\x00-\x7F]/;
exports.surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
exports.uuid3 = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-3[0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
exports.uuid4 = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
exports.uuid5 = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-5[0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
exports.uuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
exports.iso31661_2 = new RegExp(`^${ISO3166_1.ISO31661_2}$`);
exports.iso31661_3 = new RegExp(`^${ISO3166_1.ISO31661_3}$`);
exports.iso31661 = new RegExp(`^${ISO3166_1.ISO31661_2}|${ISO3166_1.ISO31661_3}$`);
exports.iso639_1 = new RegExp(`^${ISO639_4.ISO639_1}$`);
exports.iso639_2 = new RegExp(`^${ISO639_4.ISO639_2}$`);
exports.iso639_3 = new RegExp(`^${ISO639_4.ISO639_3}$`);
exports.iso639 = new RegExp(`^${ISO639_4.ISO639_1}|${ISO639_4.ISO639_3}$`);
exports.bcp47exceptions = 'en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon' +
    '|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE' +
    '|art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang';
exports.bcp47 = new RegExp(`^(?:${ISO639_4.ISO639_1}|${ISO639_4.ISO639_2})(?:-|$)` +
    `(?:(?:[A-Za-z]{2,3})|[A-Za-z]{4}|[A-Za-z]{5,8})?` +
    `(?:-([A-Za-z]{4}))?(?:-([A-Za-z]{2}|\\d{3}))?((?:-(?:[\\dA-Za-z]{5,8}|\\d[\\dA-Za-z]{3}))*)?` +
    `((?:-[\\da-wy-z](?:-[\\dA-Za-z]{2,8})+)*)?(-x(?:-[\\dA-Za-z]{1,8})+)?$` +
    `|` +
    `(?:^${exports.bcp47exceptions}$)`);
exports.mimeBase = new RegExp(`^(application|audio|chemical|font|image|message|model|multipart|text|video|x-conference|x-shader)` +
    `[\\/](?:([a-zA-Z0-9_+\\.\\-]){2,80})$`);
//# sourceMappingURL=regexStringFormats.js.map