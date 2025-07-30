// noinspection JSUnusedLocalSymbols

/**
 * @class Resource
 * A resource that provides information.
 */
export default class Resource {
	/** @type {string} The name of the resource */
	name;
	/** @type {string} A description of the resource */
	description;

	/**
	 * Creates a new Resource instance
	 * @param {Object} params - The initialization parameters
	 * @param {string} params.name - The name of the resource
	 * @param {string} params.description - The description of the resource
	 */
	constructor({ name, description } = {}) {
		this.name ??= name;
		this.description ??= description;
	}
	//description = "The Subclass should have set this";

	/**
	 * Initialize and start the service
	 * @param {TokenRingRegistry} registry - The registry object containing available services
	 * @returns {Promise<void>}
	 */
	async start(_registry) {}

	/**
	 * Stop and clean up the service
	 * @param {TokenRingRegistry} registry - The registry object containing available services
	 * @returns {Promise<void>}
	 */
	async stop(_registry) {}

	/**
	 * Get the current status of the service
	 * @param {TokenRingRegistry} registry - The registry object containing available services
	 * @returns {Promise<Object>} The status information
	 * @throws {Error} When the service doesn't implement this method
	 */
	async status(_registry) {
		throw new Error(`This service does not implement a status method.`);
	}
}
