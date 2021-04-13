/// <reference types="validator" />
import { isValidHashtag } from 'twitter-text';
declare const StringFormat: {
    isUppercase: (string: string) => boolean;
    isLowercase: (string: string) => boolean;
    isURN: (string: string) => boolean;
    isHTTPSURL: (string: string) => boolean;
    isURL: (str: string, options?: ValidatorJS.IsURLOptions) => boolean;
    isEmailWithDisplay: (string: string) => boolean;
    isEmail: (str: string, options?: ValidatorJS.IsEmailOptions) => boolean;
    isBase64: (str: string) => boolean;
    isCreditCard: (str: string) => boolean;
    isISIN: (str: string) => boolean;
    isISBN10: (string: string) => boolean;
    isISBN13: (string: string) => boolean;
    isISBN: (str: string, version?: number) => boolean;
    isDataURI: (str: string) => boolean;
    isLatLong: (str: string) => boolean;
    isMACAddress: (str: string) => boolean;
    isISO8601: (str: string, options?: ValidatorJS.IsISO8601Options) => boolean;
    isJSON: (str: string) => boolean;
    isPhoneNumber: (value: string, region?: string, onlyMobile?: boolean) => boolean;
    isMobilePhone: (value: string, region?: string) => boolean;
    isValidHashtag: typeof isValidHashtag;
    isValidText(string: string): boolean;
    isValidTweetText(string: string): boolean;
    isValidTwitterList(string: string): boolean;
};
export default StringFormat;
