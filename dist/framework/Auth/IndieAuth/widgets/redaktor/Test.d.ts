import { DNode } from '@dojo/framework/widget-core/interfaces';
import { ThemeableProperties } from '@dojo/framework/widget-core/mixins/Themeable';
export interface MfDetailsProperties extends ThemeableProperties {
    icon?: string;
    title?: string;
    baseClass?: string;
    summary?: DNode;
}
export declare const DetailsBase: any;
export default class MfDetails extends DetailsBase<MfDetailsProperties> {
    protected render(): any;
}
