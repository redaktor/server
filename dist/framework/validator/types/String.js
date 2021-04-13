"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const constants_1 = require("../constants");
const regexNumeric_1 = require("../../String/regex/regexNumeric");
const regexASCII_1 = require("../../String/regex/regexASCII");
const regexStringFormats_1 = require("../../String/regex/regexStringFormats");
class String extends base_1.default {
    constructor() {
        super(...arguments);
        this[_a] = { type: 'string' };
    }
    F(format) { return this._({ type: 'string', format }); }
    P(pattern) {
        pattern = typeof pattern === 'string' ?
            pattern : pattern.toString().replace(/^[\\/]/, '').replace(/[\\/]$/, '');
        return this._({ type: 'string', pattern });
    }
    isBooleanString() { return this.T({ enum: ['true', 'false', '1', '0'] }); }
    isNumberString() { return this.P(regexNumeric_1.default); }
    isNumericString() { return this.P(regexNumeric_1.numericNoSymbols); }
    length(min, max) {
        return this.T(max && typeof max === 'number' ?
            { minLength: min, maxLength: max } : { minLength: min });
    }
    minLength(min) { return this.T({ minLength: min }); }
    maxLength(max) { return this.T({ maxLength: max }); }
    matches(pattern, modifiers = '') {
        return this.T({
            pattern: modifiers && typeof pattern === 'string' && typeof modifiers === 'string' ?
                new RegExp(pattern, modifiers) : pattern
        });
    }
    contains(seed) { return this.T({ pattern: seed }); }
    notContains(seed) { return this.T({ not: { pattern: seed } }); }
    hasValidMime() { return this.P(regexStringFormats_1.mimeBase); }
    isIP(version) {
        version = `${version}`;
        if (version === '4') {
            return this.T({ format: 'ipv4' });
        }
        if (version === '6') {
            return this.T({ format: 'ipv6' });
        }
        return this.T({ anyOf: [{ format: 'ipv4' }, { format: 'ipv6' }] });
    }
    isUUID(version) {
        version = `${version}`;
        if (version === '3') {
            return this.P(regexStringFormats_1.uuid3);
        }
        if (version === '4') {
            return this.P(regexStringFormats_1.uuid4);
        }
        return this.P(version === '5' ? regexStringFormats_1.uuid5 : regexStringFormats_1.uuid);
    }
    isAscii() { return this.P(regexASCII_1.default); }
    isHalfWidth() { return this.P(regexStringFormats_1.halfWidth); }
    isFullWidth() { return this.P(regexStringFormats_1.fullWidth); }
    isVariableWidth() { return this.T({ allOf: [{ pattern: regexStringFormats_1.halfWidth }, { pattern: regexStringFormats_1.fullWidth }] }); }
    isHexColor() { return this.P(regexStringFormats_1.hexColor); }
    isHexadecimal() { return this.P(regexStringFormats_1.hexadecimal); }
    isMongoId() { return this.T(Object.assign({ minLength: 24, maxLength: 24 }, { pattern: regexStringFormats_1.mongoId })); }
    isMultibyte() { return this.P(regexStringFormats_1.multibyte); }
    isSurrogatePair() { return this.P(regexStringFormats_1.surrogatePair); }
    isUppercase() { return this.F('isUppercase'); }
    isLowercase() { return this.F('isLowercase'); }
    isURN() { return this.F('isURN'); }
    isHTTPSURL() { return this.F('isHTTPSURL'); }
    isRelativeURL() { return this.P(/^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/gm); }
    isURL() { return this.F('isURL'); }
    isURI() { return this.F('uri'); }
    isUriReference() { return this.F('uri-reference'); }
    isUriTemplate() { return this.F('uri-template'); }
    isHostname() { return this.F('hostname'); }
    isFQDN() { return this.F('hostname'); }
    isEmailWithDisplay() { return this.F('isEmailWithDisplay'); }
    isEmail() { return this.F('email'); }
    isHashtag() { return this.F('isValidHashtag'); }
    isDateTime() { return this.F('date-time'); }
    isDateString() { return this.F('date-time'); }
    isDate() { return this.F('date'); }
    isTime() { return this.F('time'); }
    isMilitaryTime() { return this.P(regexStringFormats_1.militaryTime); }
    isRegex() { return this.F('regex'); }
    isBase64() { return this.F('isBase64'); }
    isCreditCard() { return this.F('isCreditCard'); }
    isDataURI() { return this.F('isDataURI'); }
    isISIN() { return this.F('isISIN'); }
    isISBN(version) {
        version = `${version}`;
        return this.F(version === '10' ? 'isISBN10' : (version === '13' ? 'isISBN13' : 'isISBN'));
    }
    isISO31661(type) {
        type = `${type}`;
        return this.P(type === '2' ? regexStringFormats_1.iso31661_2 : (type === '3' ? regexStringFormats_1.iso31661_3 : regexStringFormats_1.iso31661));
    }
    isISO639(type) {
        type = `${type}`;
        if (type === '1') {
            return this.P(regexStringFormats_1.iso639_1);
        }
        return this.P(type === '2' ? regexStringFormats_1.iso639_2 : (type === '3' ? regexStringFormats_1.iso639_3 : regexStringFormats_1.iso639));
    }
    isISO8601() { return this.F('isISO8601'); }
    isBCP47() { return this.P(regexStringFormats_1.bcp47); }
    isLatLong() { return this.F('isLatLong'); }
    isMACAddress() { return this.F('isMACAddress'); }
    isJSON() { return this.F('isJSON'); }
    isPhoneNumber() { return this.F('isPhoneNumber'); }
    isMobilePhone() { return this.F('isMobilePhone'); }
}
_a = constants_1.TYPE_KEY;
exports.default = new String();
//# sourceMappingURL=String.js.map