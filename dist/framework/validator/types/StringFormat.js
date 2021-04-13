"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_libphonenumber_1 = require("google-libphonenumber");
const libPhoneNumber = google_libphonenumber_1.PhoneNumberUtil.getInstance();
const isURL = require("validator/lib/isURL");
const isEmail = require("validator/lib/isEmail");
const isBase64 = require("validator/lib/isBase64");
const isCreditCard = require("validator/lib/isCreditCard");
const isISBN = require("validator/lib/isISBN");
const isISIN = require("validator/lib/isISIN");
const isISO8601 = require("validator/lib/isISO8601");
const isJSON = require("validator/lib/isJSON");
const isDataURI = require("validator/lib/isDataURI");
const isLatLong = require("validator/lib/isLatLong");
const isMACAddress = require("validator/lib/isMACAddress");
const twitter_text_1 = require("twitter-text");
const StringFormat = {
    isUppercase: (string) => string === string.toUpperCase(),
    isLowercase: (string) => string === string.toLowerCase(),
    isURN: (string) => isURL(string, {
        require_tld: false, require_protocol: false, require_host: false,
        require_valid_protocol: false
    }),
    isHTTPSURL: (string) => isURL(string, { protocols: ['https'] }),
    isURL,
    isEmailWithDisplay: (string) => isEmail(string, { require_display_name: true }),
    isEmail,
    isBase64,
    isCreditCard,
    isISIN,
    isISBN10: (string) => isISBN(string, 10),
    isISBN13: (string) => isISBN(string, 13),
    isISBN,
    isDataURI,
    isLatLong,
    isMACAddress,
    isISO8601,
    isJSON,
    isPhoneNumber: (value, region = 'ZZ', onlyMobile = false) => {
        try {
            const phoneNum = libPhoneNumber.parseAndKeepRawInput(value, region);
            const valid = libPhoneNumber.isValidNumber(phoneNum);
            if (!onlyMobile) {
                return valid;
            }
            const mobile = libPhoneNumber.getNumberType(phoneNum) === google_libphonenumber_1.PhoneNumberType.MOBILE;
            return valid && mobile;
        }
        catch (error) {
            return false;
        }
    },
    isMobilePhone: (value, region) => StringFormat.isPhoneNumber(value, region, true),
    isValidHashtag: twitter_text_1.isValidHashtag,
    isValidText(string) {
        const invalidCharsGroup = /\uFFFE\uFEFF\uFFFF/;
        return !invalidCharsGroup.test(string);
    },
    isValidTweetText(string) {
        return !twitter_text_1.isInvalidTweet(string);
    },
    isValidTwitterList(string) {
        return twitter_text_1.isValidList(string);
    }
};
exports.default = StringFormat;
//# sourceMappingURL=StringFormat.js.map