import Chain from './base';
import { TYPE_KEY } from '../constants';
import numeric, { numericNoSymbols } from '../../String/regex/regexNumeric';
import ascii from '../../String/regex/regexASCII';
import {
  militaryTime, fullWidth, halfWidth, hexColor, hexadecimal, mongoId, multibyte,
  surrogatePair, uuid3, uuid4, uuid5, uuid, iso31661, iso31661_2, iso31661_3,
  iso639, iso639_1, iso639_2, iso639_3, bcp47, mimeBase
} from '../../String/regex/regexStringFormats';

import SFormats from './StringFormat';
type Formats = 'date-time'|'date'|'time'|'email'|'hostname'|'ipv4'|'ipv6'|
'uri'|'uri-reference'| 'iri'|'iri-reference'|'uri-template'|'json-pointer'|
'relative-json-pointer'|'regex' | keyof typeof SFormats;

/*  TODO String
// import * as isJWT from 'validator/lib/isJWT';
isISRC
isPort
import * as isAlpha from 'validator/lib/isAlpha';
import * as isAlphanumeric from 'validator/lib/isAlphanumeric';
import * as isByteLength from 'validator/lib/isByteLength';
import * as isCurrency from 'validator/lib/isCurrency';
isDecimal(str [, options]) isFloat(str [, options])
isAfter(str [, date]) isBefore(str [, date])
isMagnetURI(str)
isHash(str, algorithm)
isIdentityCard(str [, locale])
isPostalCode(str, locale)
*/
interface String {[k: string]: any; typeName: 'string';}
class String extends Chain<string> {
  [TYPE_KEY] = {type: 'string'};
  private F(format: Formats) { return  this._({ type: 'string', format }) }
  private P(pattern: string | RegExp) {
    pattern = typeof pattern === 'string' ?
      pattern : pattern.toString().replace(/^[\\/]/,'').replace(/[\\/]$/,'');
    return this._({ type: 'string', pattern })
  }

  /** Checks if a string is a boolean (e.g. is 'true' or 'false'). */
  isBooleanString() { return this.T({enum: ['true', 'false', '1', '0']}) }
  /** Checks if a string is a number. */
  isNumberString() { return this.P(numeric) }
  isNumericString() { return this.P(numericNoSymbols) }
  /** Checks if the string's length falls in a range. */
  length(min: number, max?: number) { return this.T(max && typeof max === 'number' ?
      {minLength: min, maxLength: max} : {minLength: min}) }
  /** Checks if the string's length is not less than given number. */
  minLength(min: number) { return this.T({minLength: min}) }
  /** Checks if the string's length is not more than given number. */
  maxLength(max: number) { return this.T({maxLength: max}) }
  /** Checks if string matches the pattern. Either (/foo/i) or ('foo', 'i'). */
  matches(pattern: RegExp): any
  matches(pattern: string, modifiers?: string): any
  matches(pattern: RegExp | string, modifiers: string = '') {
    return this.T({
      pattern: modifiers && typeof pattern === 'string' && typeof modifiers === 'string' ?
        new RegExp(pattern, modifiers) : pattern
    })
  }
  /** Checks if the string contains the seed. */
  contains(seed: string) { return this.T({pattern: seed}) }
  /** Checks if the string not contains the seed. */
  notContains(seed: string) { return this.T({not: {pattern: seed}}) }

  hasValidMime() { return this.P(mimeBase) }
//  '^(application|audio|chemical|font|image|message|model|multipart|text|video|x-conference|x-shader)[/](?:([a-zA-Z0-9_+\\.\\-]){2,80})$'
//  '^(application|audio|chemical|font|image|message|model|multipart|text|video|x-conference|x-shader)[/](?:([a-zA-Z0-9_+\\.\\-]){2,80})$/'
  /** Checks if the string is an IP (version 4 or 6) */
  isIP(version?: 4|6|"4"|"6") {
    version = <"4"|"6">`${version}`
    if (version === '4') { return this.T({format: 'ipv4'}) }
    if (version === '6') { return this.T({format: 'ipv6'}) }
    return this.T({anyOf: [{format: 'ipv4'}, {format: 'ipv6'}]})
  }
  /** Checks if the string is a UUID (version 3, 4 or 5). */
  isUUID(version?: 3|4|5|"3"|"4"|"5"|"") {
    version = <"3"|"4"|"5">`${version}`;
    if (version === '3') { return this.P(uuid3) }
    if (version === '4') { return this.P(uuid4) }
    return this.P(version === '5' ? uuid5 : uuid);
  }
  /** Checks if the string contains ASCII chars only. */
  isAscii() { return this.P(ascii) }
  /** Checks if the string contains any half-width chars. */
  isHalfWidth() { return this.P(halfWidth) }
  /** Checks if the string contains any full-width chars. */
  isFullWidth() { return this.P(fullWidth) }
  /** Checks if the string contains a mixture of full and half-width chars. */
  isVariableWidth() { return this.T({allOf: [{pattern: halfWidth}, {pattern: fullWidth}]}) }
  /** Checks if the string is a hexadecimal color. */
  isHexColor() { return this.P(hexColor) }
  /** Checks if the string is a hexadecimal number. */
  isHexadecimal() { return this.P(hexadecimal) }
  /** Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId. */
  isMongoId() { return this.T({ minLength: 24, maxLength: 24, ...{pattern: mongoId} }) }
  /** Checks if the string contains one or more multibyte chars. */
  isMultibyte() { return this.P(multibyte) }
  /** Checks if the string contains any surrogate pairs chars. */
  isSurrogatePair() { return this.P(surrogatePair) }
  /** Checks if the string is uppercase. */
  isUppercase() { return this.F('isUppercase') }
  /** Checks if the string is lowercase. */
  isLowercase() { return this.F('isLowercase') }
  /** Checks if the string is an urn. */
  isURN() { return this.F('isURN') }
  /** Checks if the string is a https url. */
  isHTTPSURL() { return this.F('isHTTPSURL') }
  /** Checks if the string is a relative url. */
  isRelativeURL() { return this.P(/^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/gm); }
  /** Checks if the string is an absolute url. */
  isURL() { return this.F('isURL') }
  /** Checks if the string is an uri. */
  isURI() { return this.F('uri') }
  /** Checks if the string is an uri reference. */
  isUriReference() { return this.F('uri-reference') }
  /** Checks if the string is an uri template. */
  isUriTemplate() { return this.F('uri-template') }
  /** Checks if the string is a qualified hostname. */
  isHostname() { return this.F('hostname') }
  isFQDN() { return this.F('hostname') }
  /** Checks if the string is an email with <display name> part. */
  isEmailWithDisplay() { return this.F('isEmailWithDisplay') }
  /** Checks if the string is an email. */
  isEmail() { return this.F('email') }
  /** Checks if a string is a complete representation of a date
  * (e.g. '2017-06-07T14:34:08.700Z', '2017-06-07T14:34:08.700 or '2017-06-07T14:34:08+04:00').
  */
  isHashtag() { return this.F('isValidHashtag') }
  isDateTime() { return this.F('date-time') }
  /** Checks if a string is a complete representation of a date */
  /** (e.g. '2017-06-07T14:34:08.700Z', '2017-06-07T14:34:08.700 or '2017-06-07T14:34:08+04:00'). */
  isDateString() { return this.F('date-time') }
  /** Checks if a string is the date portion of a date */
  isDate() { return this.F('date') }
  /** Checks if a string is the time portion of a date */
  isTime() { return this.F('time') }
  /** Checks if the string represents a time without a given timezone in the format HH:MM (military) */
  isMilitaryTime() { return this.P(militaryTime) }
  /** Checks if a string is a JS RegExp String */
  isRegex() { return this.F('regex') }
  /** Checks if a string is base64 encoded. */
  isBase64() { return this.F('isBase64') }
  /** Checks if the string is a credit card. */
  isCreditCard() { return this.F('isCreditCard') }
  /** Checks if the string is a postal code */
  // TODO isPostalCode() { return this.F('isPostalCode');
  /** Checks if the string is a data uri format. */
  isDataURI() { return this.F('isDataURI') }
  /** Checks if the string is an ISIN (stock/security identifier). */
  isISIN() { return this.F('isISIN') }

  /** Checks if the string is an ISBN.
  * Submit "10" or "13" to check the specific version. */
  isISBN(version?: 10|13|"10"|"13"|"") {
    version = <"10"|"13">`${version}`;
    return this.F(version === '10' ? 'isISBN10' : (version === '13' ? 'isISBN13' : 'isISBN'));
  }
  /** Checks if the string is a valid ISO 3166-1 officially assigned country code.
  * Submit "2" or "3" to check only the specific type alpha-2 or alpha-3. */
  isISO31661(type?: 2|3|"2"|"3"|"") {
    type = <"2"|"3">`${type}`;
    return this.P(type === '2' ? iso31661_2 : (type === '3' ? iso31661_3 : iso31661));
  }
  /** Checks if the string is a valid ISO 639 officially assigned language code.
  * Submit "1", "2" or "3" to check only the specific type. */
  isISO639(type?: 1|2|3|"1"|"2"|"3"|"") {
    type = <"1"|"2"|"3">`${type}`;
    if (type === '1') { return this.P(iso639_1) }
    return this.P(type === '2' ? iso639_2 : (type === '3' ? iso639_3 : iso639));
  }
  /** Checks if the string is a valid ISO 8601 date. */
  isISO8601() { return this.F('isISO8601') }
  /** Checks if the string is a valid BCP 47 language tag. */
  isBCP47() { return this.P(bcp47) }
  /** Checks if the string is a valid latitude-longitude coordinate in the format lat,long */
  isLatLong() { return this.F('isLatLong') }
  /** Checks if the string is a MAC address. */
  isMACAddress() { return this.F('isMACAddress') }
  /** Checks if the string is valid JSON. */
  isJSON() { return this.F('isJSON') }
  /* TODO isJWT Checks if the string is valid JWT token. */

  /**
  * Checks if the string is a valid phone number.
  * @param value the potential phone number string to test
  * @param {string} region 2 characters uppercase country code (e.g. DE, US, CH).
  * If users must enter the intl. prefix (e.g. +41), then you may omit region.
  * See google-libphonenumber on github
  */
  isPhoneNumber() { return this.F('isPhoneNumber') }
  /**
  * Checks if the string is a valid mobile phone number.
  * @param value the potential phone number string to test
  * @param {string} region 2 characters uppercase country code (e.g. DE, US, CH).
  * If users must enter the intl. prefix (e.g. +41), then you may omit region.
  */
  isMobilePhone() { return this.F('isMobilePhone') }
}

export default new String();
