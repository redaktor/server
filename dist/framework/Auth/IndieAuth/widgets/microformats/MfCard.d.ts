import WidgetBase, { DNode, WidgetProperties } from '../../../../webcomponents/WidgetBase';
export default class Card extends WidgetBase<WidgetProperties> {
    protected hOrg(o: any, isSmall?: boolean, isOrg?: boolean): DNode;
    protected avatar(o: any, isSmall?: boolean, isOrg?: boolean): DNode;
    protected notes(o: any, isSmall?: boolean, isOrg?: boolean, caption?: string): DNode;
    protected orgs(o: any, isSmall?: boolean, isOrg?: boolean, caption?: string): DNode;
    protected contact(o: any, isSmall?: boolean, isOrg?: boolean, captions?: any): DNode;
    protected address(o: any, isSmall?: boolean, isOrg?: boolean, captions?: any): DNode;
    protected categories(o: any, isSmall?: boolean, isOrg?: boolean, caption?: string): DNode;
    protected urls(o: any, isSmall?: boolean, isOrg?: boolean, caption?: string): DNode;
    protected extra(o: any, p: string, title?: string, icon?: DNode, isDT?: boolean): any;
    protected extras(o: any, isSmall?: boolean, isOrg?: boolean, messages?: any): DNode;
    protected render(): DNode;
}
