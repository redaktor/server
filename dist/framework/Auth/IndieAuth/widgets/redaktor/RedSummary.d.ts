import WidgetBase, { DNode, WidgetProperties } from '../../../../webcomponents/WidgetBase';
export interface MfDetailsProperties extends WidgetProperties {
    icon?: string;
    title?: string;
    baseClass?: string;
    summary?: DNode;
}
export default class MfDetails extends WidgetBase<MfDetailsProperties> {
    protected render(): any;
}
