
// noinspection JSUnusedLocalSymbols

/**
 * @class Resource
 * A resource that provides information.
 */
export default class Resource {
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
}