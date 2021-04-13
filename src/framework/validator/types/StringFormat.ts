import { PhoneNumberUtil, PhoneNumberType } from 'google-libphonenumber';
const libPhoneNumber = PhoneNumberUtil.getInstance();
import * as isURL from 'validator/lib/isURL';
import * as isEmail from 'validator/lib/isEmail';
import * as isBase64 from 'validator/lib/isBase64';
import * as isCreditCard from 'validator/lib/isCreditCard';
import * as isISBN from 'validator/lib/isISBN';
import * as isISIN from 'validator/lib/isISIN';
import * as isISO8601 from 'validator/lib/isISO8601';
import * as isJSON from 'validator/lib/isJSON';

import * as isPostalCode from 'validator/lib/isPostalCode';

import * as isDataURI from 'validator/lib/isDataURI';
import * as isLatLong from 'validator/lib/isLatLong';
import * as isMACAddress from 'validator/lib/isMACAddress';

import { isValidHashtag, isInvalidTweet, isValidList } from 'twitter-text';

const StringFormat = {
  isUppercase: (string: string) => string === string.toUpperCase(),
  isLowercase: (string: string) => string === string.toLowerCase(),
  isURN: (string: string) => isURL(string, {
    require_tld: false, require_protocol: false, require_host: false,
    require_valid_protocol: false
  }),
  isHTTPSURL: (string: string) => isURL(string, { protocols: ['https'] }),
  isURL,
  isEmailWithDisplay: (string: string) => isEmail(string, { require_display_name: true }),
  isEmail,
  isBase64,
  isCreditCard,
  isISIN,
  isISBN10: (string: string) => isISBN(string, 10),
  isISBN13: (string: string) => isISBN(string, 13),
  isISBN,
  isDataURI,
  isLatLong,
  isMACAddress,
  isISO8601,
  isJSON,
  //isPostalCode, // TODO
  isPhoneNumber: (value: string, region: string = 'ZZ', onlyMobile = false): boolean => {
    try {
      const phoneNum = libPhoneNumber.parseAndKeepRawInput(value, region);
      const valid = libPhoneNumber.isValidNumber(phoneNum);
      if (!onlyMobile) { return valid }
      const mobile = libPhoneNumber.getNumberType(phoneNum) === PhoneNumberType.MOBILE
      return valid && mobile
    } catch (error) {
      return false;
    }
  },
  isMobilePhone: (value: string, region?: string) =>
    StringFormat.isPhoneNumber(value, region, true),

  isValidHashtag,
  isValidText(string: string) {
    const invalidCharsGroup = /\uFFFE\uFEFF\uFFFF/;
    return !invalidCharsGroup.test(string)
  },
  isValidTweetText(string: string) {
    return !isInvalidTweet(string);
  },
  isValidTwitterList(string: string) {
    return isValidList(string);
  }
  /*
  isAlpha, isAlphanumeric, isByteLength, isCurrency, isFQDN, isISBN
  isAlpha(str [, locale]) Checks if the string contains only letters (a-zA-Z).
  isAlphanumerica(str [, locale]) Checks if the string contains only letters and numbers.
  isByteLength(min: number, max?: number)	Checks if the string's length (in bytes) falls in a range.
  isCurrency(options?: IsCurrencyOptions)	Checks if the string is a valid currency amount.
  */
}
export default StringFormat;
