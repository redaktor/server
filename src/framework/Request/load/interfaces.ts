export interface AmdFactory {
	/**
	 * The module factory
	 *
	 * @param modules The arguments that represent the resolved versions of the module dependencies
	 */
	(...modules: any[]): any;
}

export interface AmdDefine {
	/**
	 * Define a module
	 *
	 * @param moduleId the MID to use for the module
	 * @param dependencies an array of MIDs this module depends upon
	 * @param factory the factory function that will return the module
	 */
	(moduleId: string, dependencies: string[], factory: AmdFactory): void;

	/**
	 * Define a module
	 *
	 * @param dependencies an array of MIDs this module depends upon
	 * @param factory the factory function that will return the module
	 */
	(dependencies: string[], factory: AmdFactory): void;

	/**
	 * Define a module
	 *
	 * @param factory the factory function that will return the module
	 */
	(factory: AmdFactory): void;

	/**
	 * Define a module
	 *
	 * @param value the value for the module
	 */
	(value: any): void;

	/**
	 * Meta data about this particular AMD loader
	 */
	amd: { [prop: string]: string | number | boolean };
}


export interface NodeRequire {
	(moduleId: string): any;
	resolve(moduleId: string): string;
}

export interface AmdPackage {
	/**
	 * The path to the root of the package
	 */
	location?: string;

	/**
	 * The main module of the package (defaults to `main.js`)
	 */
	main?: string;

	/**
	 * The package name
	 */
	name?: string;
}

export interface AmdRequire {
	/**
	 * Resolve a list of module dependencies and pass them to the callback
	 *
	 * @param dependencies The array of MIDs to resolve
	 * @param callback The function to invoke with the resolved dependencies
	 */
	(dependencies: string[], callback: AmdRequireCallback): void;

	/**
	 * Resolve and return a single module (compatability with CommonJS `require`)
	 *
	 * @param moduleId The module ID to resolve and return
	 */
	<ModuleType>(moduleId: string): ModuleType;

	/**
	 * If running in the node environment, a reference to the original NodeJS `require`
	 */
	nodeRequire?: NodeRequire;

	/**
	 * Take a relative MID and return an absolute MID
	 *
	 * @param moduleId The relative module ID to resolve
	 */
	toAbsMid(moduleId: string): string;

	/**
	 * Take a path and resolve the full URL for the path
	 *
	 * @param path The path to resolve and return as a URL
	 */
	toUrl(path: string): string;
}

export interface AmdRequireCallback {
	/**
	 * The `require` callback
	 *
	 * @param modules The arguments that represent the resolved versions of dependencies
	 */
	(...modules: any[]): void;
}
