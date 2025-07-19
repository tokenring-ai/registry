/**
 * @typedef {import('./Service.js').default} TokenRingService
 */

import Service from "./Service.js";

// noinspection JSClosureCompilerSyntax
/**
 * @class ServiceRegistry
 * Manages available and active services.
 */
export default class ServiceRegistry {
 /**
  * Set of available services
  * @type {Set<TokenRingService>}
  */
 availableServices = new Set();

 /**
  * Whether services have been started
  * @type {boolean}
  */
 started = false;

 /**
  * Reference to the registry passed to services
  * @type {Object|null}
  */
 registry = null;

 /**
  * Starts all available services
  * @param {TokenRingRegistry} registry - The registry object to pass to services
  * @returns {Promise<void>}
  */
 async start(registry) {
  this.registry = registry;
  this.started = true;

  for (const service of this.availableServices) {
   if (service.start) await service.start(registry);
  }
 }

 /**
  * Stops all available services
  * @param {TokenRingRegistry} registry - The registry object to pass to services
  * @returns {Promise<void>}
  */
 async stop(registry) {
  for (const service of this.availableServices) {
   if (service.stop) await service.stop(registry);
  }
 }

 /**
  * Adds one or more services to the registry
  * @param {...TokenRingService|TokenRingService[]} services - Services to add
  * @returns {Promise<void>}
  * @throws {Error} If any service is not an instance of Service
  */
 async addServices(...services) {
  for (const service of services.flat()) {
   if (!(service instanceof Service)) {
    throw new Error(`Cannot add service of type ${typeof service} to registry. Only instances of Service are supported.`);
   }

   this.availableServices.add(service);
   if (this.started) await service.start(this.registry);
  }
 }

 /**
  * Removes one or more services from the registry
  * @param {...TokenRingService|TokenRingService[]} services - Services to remove
  * @returns {Promise<void>}
  */
 async removeServices(...services) {
  for (const service of services.flat()) {
   this.availableServices.delete(service);
   if (this.started) await service.stop(this.registry);
  }
 }

 /**
  * Gets the names of all available services
  * @returns {string[]} An array of available service names
  */
 getServiceNames() {
  return this.getServices().map(service => service.name);
 }

 /**
  * Gets all available services
  * @returns {TokenRingService[]} An array of all available services
  */
 getServices() {
  return Array.from(this.availableServices);
 }

 /**
  * Gets all services of a specific type
  * @template {TokenRingService} T
  * @param {new() => T} type - The type to filter by
  * @returns {T[]} The first service of the specified type, or undefined if none found
  */
 getServicesByType(type) {
  return Array.from(this.availableServices).filter(service => service instanceof type);
 }

 /**
  * Gets all services with a specific name
  * @param {string} name - The name to filter by
  * @returns {TokenRingService[]} An array of services with the specified name
  */
 getServicesByName(name) {
  return Array.from(this.availableServices).filter(service => service.name === name);
 }

 /**
  * Gets the first service of a specific type
  * @template {TokenRingService} T
  * @param {new() => T} type - The constructor of the type to filter by
  * @returns {T|undefined} The first service of the specified type, or undefined if none found
  */
 getFirstServiceByType(type) {
  return this.getServicesByType(type)?.[0];
 }

 /**
  * Requires the first service of a specific type
  * @template {TokenRingService} T
  * @param {new() => T} type - The constructor of the type to filter by
  * @returns {T} The first service of the specified type
  * @throws {Error} If no service of the specified type is found
  */
 requireFirstServiceByType(type) {
  const ret = this.getFirstServiceByType(type);
  if (!ret) throw new Error(`Cannot find a service of type: ${type}`);
  return ret;
 }

 /**
  * Asynchronously yields memories from enabled services
  * @async
  * @generator
  * @yields {MemoryItem} Memory object with role and content
  */
 async* getMemories() {
  for (const service of this.getServices()) {
   if (service.getMemories) {
    yield* service.getMemories(this.registry);
   }
  }
 }

 /**
  * Asynchronously yields attention items from enabled services
  * @async
  * @generator
  * @yields {AttentionItem} Memory object with role and content
  */
 async* getAttentionItems() {
  for (const service of this.getServices()) {
   if (service.getAttentionItems) {
    yield* service.getAttentionItems(this.registry);
   }
  }
 }
}