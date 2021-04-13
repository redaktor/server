import Collection from '../Collection';
export default class STRING extends Collection {
    protected _input: string;
    constructor(_input?: string, ...args: any[]);
    $splitSentences(): Promise<void>;
}
