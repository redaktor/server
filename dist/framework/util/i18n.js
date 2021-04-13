"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@dojo/framework/i18n/main");
const localLanguages = {
    af: 'Afrikaans',
    am: 'አማርኛ',
    ar: 'العربية',
    az: 'azərbaycan',
    be: 'беларуская',
    bg: 'български',
    bn: 'বাংলা',
    bs: 'bosanski',
    ca: 'català',
    cs: 'čeština',
    cy: 'Cymraeg',
    da: 'dansk',
    de: 'Deutsch',
    'de-AT': 'Österreichisches Deutsch',
    'de-at': 'Österreichisches Deutsch',
    'de-CH': 'Schweizer Hochdeutsch',
    'de-ch': 'Schweizer Hochdeutsch',
    el: 'Ελληνικά',
    en: 'English',
    'en-AU': 'Australian English',
    'en-au': 'Australian English',
    'en-CA': 'Canadian English',
    'en-ca': 'Canadian English',
    'en-GB': 'British English',
    'en-gb': 'British English',
    es: 'español',
    'es-419': 'español latinoamericano',
    'es-MX': 'español de México',
    'es-mx': 'español de México',
    et: 'eesti',
    eu: 'euskara',
    fa: 'فارسی',
    'fa-AF': 'دری',
    'fa-af': 'دری',
    fi: 'suomi',
    fil: 'Filipino',
    fo: 'føroyskt',
    fr: 'français',
    'fr-CA': 'français canadien',
    'fr-ca': 'français canadien',
    'fr-CH': 'français suisse',
    'fr-ch': 'français suisse',
    ga: 'Gaeilge',
    gl: 'galego',
    gu: 'ગુજરાતી',
    he: 'עברית',
    hi: 'हिन्दी',
    hr: 'hrvatski',
    hu: 'magyar',
    hy: 'հայերեն',
    id: 'Indonesia',
    is: 'íslenska',
    it: 'italiano',
    ja: '日本語',
    ka: 'ქართული',
    kk: 'қазақ тілі',
    km: 'ខ្មែរ',
    kn: 'ಕನ್ನಡ',
    ko: '한국어',
    ky: 'кыргызча',
    lo: 'ລາວ',
    lt: 'lietuvių',
    lv: 'latviešu',
    mk: 'македонски',
    ml: 'മലയാളം',
    mn: 'монгол',
    mr: 'मराठी',
    ms: 'Bahasa Melayu',
    my: 'မြန်မာ',
    nb: 'norsk bokmål',
    ne: 'नेपाली',
    nl: 'Nederlands',
    'nl-BE': 'Nederlands (België)',
    'nl-be': 'Nederlands (België)',
    pa: 'ਪੰਜਾਬੀ',
    pl: 'polski',
    pt: 'português',
    'pt-PT': 'português europeu',
    'pt-pt': 'português europeu',
    ro: 'română',
    'ro-MD': 'moldovenească',
    'ro-md': 'moldovenească',
    ru: 'русский',
    si: 'සිංහල',
    sk: 'slovenčina',
    sl: 'slovenščina',
    sq: 'shqip',
    sr: 'српски',
    'sr-Latn': 'srpski',
    'sr-latn': 'srpski',
    'sr-Latn-BA': 'srpski',
    'sr-latn-ba': 'srpski',
    'sr-Latn-ME': 'srpski',
    'sr-latn-me': 'srpski',
    'sr-Latn-XK': 'srpski',
    'sr-latn-xk': 'srpski',
    sv: 'svenska',
    sw: 'Kiswahili',
    'sw-CD': 'Kingwana',
    'sw-cd': 'Kingwana',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    th: 'ไทย',
    to: 'lea fakatonga',
    tr: 'Türkçe',
    uk: 'українська',
    ur: 'اردو',
    uz: 'o‘zbek',
    vi: 'Tiếng Việt',
    yue: '粵語',
    zh: '中文',
    'zh-Hans': '简体中文',
    'zh-hans': '简体中文',
    'zh-Hant': '繁體中文',
    'zh-hant': '繁體中文',
    zu: 'isiZulu'
};
function getLocalLangName(locale) {
    if (locale.indexOf('-') < 0) { }
    return !!(localLanguages[locale]) ? localLanguages[locale] : '';
}
exports.getLocalLangName = getLocalLangName;
function getLocaleObj(langs_req, bundle) {
    if (!bundle) {
        return { locale: main_1.default.locale };
    }
    const langs = (typeof langs_req.acceptsLanguages === 'function') ?
        langs_req.acceptsLanguages() : (Array.isArray(langs_req) ? langs_req : [langs_req]);
    var i;
    for (i = 0; i < langs.length; i++) {
        const rootLang = langs[i].split('-')[0];
        if (bundle.locales.indexOf(langs[i]) > -1) {
            return { locale: langs[i] };
        }
        else if (bundle.locales.indexOf(rootLang) > -1) {
            return { locale: rootLang };
        }
    }
    return { locale: 'en' };
}
exports.getLocaleObj = getLocaleObj;
function getCachedI18n(locale_req, bundle) {
    const locale = (typeof locale_req.acceptsLanguages === 'function') ?
        getLocaleObj(locale_req, bundle).locale : locale_req;
    const cached = main_1.getCachedMessages(bundle, locale);
    if (!!cached) {
        return Promise.resolve({ messages: cached, locale: locale });
    }
    return main_1.default(bundle, locale).then(m => ({ messages: m, locale: locale }));
}
exports.getCachedI18n = getCachedI18n;
//# sourceMappingURL=i18n.js.map