/**
 * @typedef {Object} TokenRingTool
 * @param {object} definition
 * @param {string} definition.name - The name of the tool.
 * @param {Object} definition.tool - The tool configuration object
 * @param {string} definition.pkg - The tool package name
 * @param {string} definition.tool.description - The tool description
 * @param {function(Object, TokenRingRegistry): Promise<string>} definition.tool.execute - Function called when tool is executed
 * @param {import('zod').ZodObject} definition.tool.parameters - The tool specification
 * @property {*} [:string] - Any additional properties
 */

import Service from "./Service.js";

/**
 * @class ToolRegistry
 * Manages available and active tools
 */
export default class ToolRegistry extends Service {
	/**
	 * @type {Object.<string, TokenRingTool>}
	 */
	availableTools = {};

	/**
	 * @type {Set<string>}
	 */
	activeToolNames = new Set();

	/**
	 * @type {Object|null}
	 */
	registry = null;

	/**
	 * Starts the tool registry
	 * @param {TokenRingRegistry} registry - The registry instance
	 * @returns {Promise<void>}
	 */
	async start(registry) {
		this.registry = registry;
	}

	// noinspection JSUnusedLocalSymbols
	/**
	 * Stops the tool registry
	 * @param {TokenRingRegistry} registry - The registry instance
	 * @returns {Promise<void>}
	 */
	async stop(registry) {
		await this.disableTools(...this.activeToolNames);
	}

	/**
	 * Adds a tool with the specified name and properties.
	 * @param {string} name - The name of the tool.
	 * @param {TokenRingTool} definition
	 * @returns {Promise<void>}
	 */
	async addTool(name, definition) {
		this.availableTools[name] = definition;
	}

	/**
	 * Enables the specified tools.
	 * @param {...string} names - The names of tools to enable
	 * @returns {Promise<void>}
	 */
	async enableTools(...names) {
		for (const name of names.flat()) {
			if (!this.activeToolNames.has(name)) {
				this.activeToolNames.add(name);
				const tool = this.availableTools[name];
				if (tool.start) await tool.start(this.registry);
			}
		}
	}

	/**
	 * Disables the specified tools.
	 * @param {...string} names - The names of tools to disable
	 * @returns {Promise<void>}
	 * @throws {Error} If attempting to deactivate the root context.
	 */
	async disableTools(...names) {
		for (const name of names.flat()) {
			if (name === "root") {
				throw new Error("Cannot deactivate root context");
			}
			if (this.activeToolNames.has(name)) {
				this.activeToolNames.delete(name);
				const tool = this.availableTools[name];
				if (tool.stop) await tool.stop(this.registry);
			}
		}
	}

	/**
	 * Sets the enabled tools, clearing existing ones except for the specified names.
	 * @param {...string} names - The names of tools to enable
	 * @returns {Promise<void>}
	 */
	async setEnabledTools(...names) {
		for (const name of this.activeToolNames) {
			if (!names.includes(name)) {
				await this.disableTools(name);
			}
		}
		for (const name of names) {
			if (!this.activeToolNames.has(name)) {
				await this.enableTools(name);
			}
		}
	}

	/**
	 * Gets the names of all available tools
	 * @returns {string[]} An array of available tool names.
	 */
	getAvailableToolNames() {
		return Object.keys(this.availableTools);
	}

	/**
	 * Gets all available tools grouped by package
	 * @returns {Object.<string, string[]>} An object where keys are package names and values are arrays of tool names
	 */
	getToolsByPackage() {
		const toolsByPackage = {};

		for (const [toolName, toolDef] of Object.entries(this.availableTools)) {
			const packageName = toolDef.packageName || "unknown";
			if (!toolsByPackage[packageName]) {
				toolsByPackage[packageName] = [];
			}
			toolsByPackage[packageName].push(toolName);
		}

		// Sort tools within each package
		for (const packageName in toolsByPackage) {
			toolsByPackage[packageName].sort((a, b) => a.localeCompare(b));
		}

		return toolsByPackage;
	}

	/**
	 * Gets the names of all enabled tools.
	 * @returns {string[]} An array of active tool names.
	 */
	getEnabledToolNames() {
		return Array.from(this.activeToolNames);
	}

	/**
	 * Gets all active tools.
	 * @returns {TokenRingTool[]} An array of active tools.
	 */
	getActiveTools() {
		return Array.from(this.iterateActiveTools());
	}

	/**
	 * Generator that iterates through all active tools.
	 * @generator
	 * @yields {TokenRingTool} The next active tool.
	 * @returns {Generator<TokenRingTool, void, unknown>}
	 */
	*iterateActiveTools() {
		for (const name of this.activeToolNames) {
			yield this.availableTools[name];
		}
	}

	/**
	 * Gets a tool by its name
	 * @param {string} name - The name of the tool to retrieve
	 * @returns {TokenRingTool|undefined} The requested tool or undefined if not found
	 */
	getToolByName(name) {
		return this.availableTools[name];
	}
}
