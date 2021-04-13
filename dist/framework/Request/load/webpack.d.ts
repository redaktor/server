import { isPlugin, useDefault } from './util';
export default function load(contextRequire: () => string, ...mids: string[]): Promise<any[]>;
export default function load(...mids: string[]): Promise<any[]>;
export { isPlugin, useDefault };
