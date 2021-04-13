import WidgetBase from '../../../../../widgets/baseInput';
export declare type Sizes = 'mini' | 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'massive';
export declare type Aligns = 'top' | 'middle' | 'bottom';
export default class Image extends WidgetBase<any> {
    sizes: any;
    aligns: any;
    protected render(): any;
}
