// noinspection JSUnusedLocalSymbols

/**
 * @typedef {Object} MemoryItem
 * @property {string} role
 * @property {string} content
 */

/**
 * @typedef {Object} AttentionItem
 * @property {string} role
 * @property {string} content
 */


/**
 * Base Service class that all services should extend.
 * Manages available and active services in the registry.
 * @abstract
 */
export default class Service {
 /**
  * The name of the service
  * @type {string}
  */
 name = "The Subclass should have set this";

 /**
  * Description of the service's functionality
  * @type {string}
  */
 description = "The Subclass should have set this";

 /**
  * Initialize and start the service
  * @param {TokenRingRegistry} registry - The registry object containing available services
  * @returns {Promise<void>}
  */
 async start(registry) {}

 /**
  * Stop and clean up the service
  * @param {TokenRingRegistry} registry - The registry object containing available services
  * @returns {Promise<void>}
  */
 async stop(registry) {}

 /**
  * Get the current status of the service
  * @param {TokenRingRegistry} registry - The registry object containing available services
  * @returns {Promise<Object>} The status information
  * @throws {Error} When the service doesn't implement this method
  */
 async status(registry) {
  throw new Error(`This service does not implement a status method.`);
 }

 /**
  * Optional method that services can implement to provide memories
  * @param {TokenRingRegistry} registry - The registry object containing available services
  * @async
  * @generator
  * @yields {MemoryItem} - Memories
  */
 async *getMemories(registry) {}


 /**
  * Optional method that services can implement to provide attention items
  * @param {TokenRingRegistry} registry - The registry object containing available services
  * @async
  * @generator
  * @yields {AttentionItem} - Attention Item
  */
 async *getAttentionItems(registry) {}
}