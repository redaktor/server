import { Bundle } from '@dojo/framework/i18n/main';
export declare function getLocalLangName(locale: string): any;
export declare function getLocaleObj(langs_req: any, bundle?: Bundle<any>): {
    locale: any;
};
export declare function getCachedI18n(locale_req: any, bundle: Bundle<any>): Promise<{
    messages: any;
    locale: any;
}>;
