/**
 * @typedef {import('./Resource.js').default} TokenRingResource
 */

/**
 * @class ResourceRegistry
 * Manages available and active resources
 */
export default class ResourceRegistry {
 /**
  * @type {Record<string, Set<TokenRingResource>>}
  */
 availableResources = {};

 /**
  * @type {Set<string>}
  */
 activeResourceNames = new Set();
 registry = null;


 async start(registry) {
  this.registry = registry;
 }

 // noinspection JSUnusedLocalSymbols
 async stop(registry) {
  await this.disableResources(...this.activeResourceNames);
 }

 /**
  * Adds one or more resources under the specified name.
  * @param {string} name - The name of the resource.
  * @param {...TokenRingResource} resources - The resources to add.
  */
 async addResource(name, ...resources) {
  for (const impl of resources.flat()) {
   (this.availableResources[name] ??= new Set()).add(impl);
  }
 }
 /**
  * Activates the specified registry.
  * @param {...string} names - The resource names to enable (supports prefix* pattern)
  */
 async enableResources(...names) {
  for (const name of names.flat()) {
   if (name.endsWith('*')) {
    // Handle prefix matching
    const prefix = name.slice(0, -1);
    const matchingNames = Object.keys(this.availableResources).filter(resourceName =>
     resourceName.startsWith(prefix)
    );
    for (const matchingName of matchingNames) {
     if (!this.activeResourceNames.has(matchingName)) {
      this.activeResourceNames.add(matchingName);
      for (const impl of this.availableResources[matchingName] ?? []) {
       if (impl.start) await impl.start(this.registry);
      }
     }
    }
   } else {
    // Handle exact matching
    if (!this.activeResourceNames.has(name)) {
     this.activeResourceNames.add(name);
     for (const impl of this.availableResources[name] ?? []) {
      if (impl.start) await impl.start(this.registry);
     }
    }
   }
  }
 }

 /**
  * Deactivates the specified resources.
  * @param {...string} names - The resource names to disable (supports prefix* pattern)
  * @throws {Error} If attempting to deactivate the root context.
  */
 async disableResources(...names) {
  for (const name of names.flat()) {
   if (name === 'root') {
    throw new Error('Cannot deactivate root context');
   }

   if (name.endsWith('*')) {
    // Handle prefix matching
    const prefix = name.slice(0, -1);
    const matchingNames = Array.from(this.activeResourceNames).filter(resourceName =>
     resourceName.startsWith(prefix)
    );
    for (const matchingName of matchingNames) {
     if (matchingName !== 'root') { // Additional safety check for root
      this.activeResourceNames.delete(matchingName);
      for (const impl of this.availableResources[matchingName] ?? []) {
       if (impl.stop) await impl.stop(this.registry);
      }
     }
    }
   } else {
    // Handle exact matching
    if (this.activeResourceNames.has(name)) {
     this.activeResourceNames.delete(name);
     for (const impl of this.availableResources[name] ?? []) {
      if (impl.stop) await impl.stop(this.registry);
     }
    }
   }
  }
 }

 /**
  * Sets the active resources, clearing existing ones except for the root.
  * @param {...string} names - The resource names to enable
  */
 async setEnabledResources(...names) {
  for (const name of this.activeResourceNames) {
   if (!names.includes(name)) {
    await this.disableResources(name);
   }
  }
  for (const name of names) {
   if (!this.activeResourceNames.has(name)) {
    await this.enableResources(name);
   }
  }
 }

 /**
  * Gets the names of all available resources
  * @returns {string[]} An array of available resource names.
  */
 getAvailableResourceNames() {
  return Object.keys(this.availableResources);
 }

 /**
  * Gets the names of all active resources.
  * @returns {string[]} An array of active resource names.
  */
 getEnabledResourceNames() {
  return Array.from(this.activeResourceNames);
 }

 /**
  * Gets all active resources.
  * @returns {TokenRingResource[]} An array of active resources.
  */
 getActiveResources() {
  const ret = [];
  for (const name of this.activeResourceNames) {
   for (const impl of this.availableResources[name] ?? []) {
    ret.push(impl);
   }
  }
  return ret;
 }



 // noinspection JSClosureCompilerSyntax
 /**
  * Gets all active resources of a specific type.
  * @template {TokenRingResource} T
  * @param {new() => T} type - The constructor function/class to filter resources by
  * @returns {T[]} An array of active resources that are instances of the specified type
  */
 getResourcesByType(type) {
  const ret = [];
  for (const name of this.activeResourceNames) {
   for (const impl of this.availableResources[name] ?? []) {
    if (impl instanceof type) {
     ret.push(impl);
    }
   }
  }
  return ret;
 }
}