import ResourceRegistry from "./ResourceRegistry.js";
import ToolRegistry from "./ToolRegistry.js";
import ChatCommandRegistry from "./ChatCommandRegistry.js";
import ServiceRegistry from "./ServiceRegistry.js";

/**
 * @typedef {Object} TokenRingPackage
 * @property {string} name - Package name
 * @property {string} version - Package version
 * @property {string} description - Package description
 * @property {function(TokenRingRegistry): Promise<void>} [start] - Called when package is started
 * @property {function(TokenRingRegistry): Promise<void>} [stop] - Called when package is stopped
 * @property {Object<string,TokenRingTool>} [tools] - Array of tools to register
 * @property {Object<string,TokenRingChatCommand>} [chatCommands] - Array of chat commands to register
 * @property {*} [:string] - Any additional properties
 */
/**
 * @class TokenRingRegistry
 * Manages available and active packageRegistry.
 */
export default class TokenRingRegistry {
	/**
	 * @type {Set<TokenRingPackage>}
	 */
	availablePackages = new Set();
	started = false;
	registry = null;

	/**
	 * @type {ServiceRegistry}
	 */
	services = new ServiceRegistry();
	/**
	 * @type {ResourceRegistry}
	 */
	resources = new ResourceRegistry();
	/**
	 * @type {ToolRegistry}
	 */
	tools = new ToolRegistry();
	/**
	 * @type {ChatCommandRegistry}
	 */
	chatCommands = new ChatCommandRegistry();

	async start() {
		for (const pkg of this.availablePackages) {
			if (pkg.start) await pkg.start(this);
		}

		return Promise.all([
			this.services.start(this),
			this.resources.start(this),
			this.tools.start(this),
		]);
	}
	async stop() {
		await Promise.all([
			this.services.stop(this),
			this.resources.stop(this),
			this.tools.stop(this),
		]);

		for (const pkg of this.availablePackages) {
			if (pkg.stop) await pkg.stop(this);
		}
	}

	/**
	 * Adds one or more packages to the registry.
	 * @param {...TokenRingPackage} packages - Packages to add
	 * @returns {Promise<void>}
	 */
	async addPackages(...packages) {
		for (const pkg of packages.flat()) {
			this.availablePackages.add(pkg);
			if (this.started) await pkg.start(this);

			if (pkg.tools) {
				for (const toolName in pkg.tools) {
					await this.tools.addTool(toolName, {
						name: toolName,
						packageName: pkg.name,
						...pkg.tools[toolName],
					});
				}
			}

			if (pkg.chatCommands) {
				for (const commandName in pkg.chatCommands) {
					await this.chatCommands.addCommand(
						commandName,
						pkg.chatCommands[commandName],
					);
				}
			}
		}
	}

	/**
	 * Removes one or more packages from the registry.
	 * @param {...TokenRingPackage} packages - Packages to remove
	 * @returns {Promise<void>}
	 */
	async removePackages(...packages) {
		for (const pkg of packages.flat()) {
			this.availablePackages.delete(pkg);
			if (this.started) await pkg.stop(this);
		}
	}

	/**
	 * Gets the names of all available resources.
	 * @returns {string[]} An array of available context names.
	 */
	getPackageNames() {
		return this.getPackages().map((pkg) => pkg.name);
	}

	/**
	 * Gets all packages
	 * @returns {TokenRingPackage[]} A set of active packageRegistry.
	 */
	getPackages() {
		return Array.from(this.availablePackages);
	}

	// noinspection JSClosureCompilerSyntax
	/**
	 * Gets the first active context of a specific type.
	 * @template {TokenRingService} T
	 * @param {new() => T} type - The constructor of the type to filter by.
	 * @returns {T|undefined} The first context of the specified type, or undefined if none found.
	 */
	getFirstServiceByType(type) {
		return this.services.getServicesByType(type)?.[0];
	}

	// noinspection JSClosureCompilerSyntax
	/**
	 * Requires the first active context of a specific type.
	 * @template {TokenRingService} T
	 * @param {new() => T} type - The constructor of the type to filter by.
	 * @returns {T} The first context of the specified type.
	 * @throws {Error} If no context of the specified type is found.
	 */
	requireFirstServiceByType(type) {
		const ret = this.services.getFirstServiceByType(type);
		if (!ret)
			throw new Error(`Cannot find a context of type: ${type.name ?? type}`);
		return ret;
	}
}
