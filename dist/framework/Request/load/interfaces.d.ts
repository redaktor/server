export interface AmdFactory {
    (...modules: any[]): any;
}
export interface AmdDefine {
    (moduleId: string, dependencies: string[], factory: AmdFactory): void;
    (dependencies: string[], factory: AmdFactory): void;
    (factory: AmdFactory): void;
    (value: any): void;
    amd: {
        [prop: string]: string | number | boolean;
    };
}
export interface NodeRequire {
    (moduleId: string): any;
    resolve(moduleId: string): string;
}
export interface AmdPackage {
    location?: string;
    main?: string;
    name?: string;
}
export interface AmdRequire {
    (dependencies: string[], callback: AmdRequireCallback): void;
    <ModuleType>(moduleId: string): ModuleType;
    nodeRequire?: NodeRequire;
    toAbsMid(moduleId: string): string;
    toUrl(path: string): string;
}
export interface AmdRequireCallback {
    (...modules: any[]): void;
}
