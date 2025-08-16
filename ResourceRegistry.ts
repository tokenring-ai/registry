import {Registry} from "./index.js";

type TokenRingResource = import("./Resource.ts").default;

export default class ResourceRegistry {
  availableResources: Record<string, Set<TokenRingResource>> = {};
  activeResourceNames: Set<string> = new Set();
  registry: Registry | null = null;

  async start(registry: Registry): Promise<void> {
    this.registry = registry;
  }

  async stop(_registry: Registry): Promise<void> {
    await this.disableResources(...this.activeResourceNames);
  }

  async addResource(name: string, ...resources: TokenRingResource[] | TokenRingResource[][]): Promise<void> {
    for (const impl of (resources as TokenRingResource[]).flat()) {
      (this.availableResources[name] ??= new Set()).add(impl);
    }
  }

  async enableResources(...names: string[] | string[][]): Promise<void> {
    for (const name of (names as string[]).flat()) {
      if (name.endsWith("*")) {
        const prefix = name.slice(0, -1);
        const matchingNames = Object.keys(this.availableResources).filter((resourceName) => resourceName.startsWith(prefix));
        for (const matchingName of matchingNames) {
          if (!this.activeResourceNames.has(matchingName)) {
            this.activeResourceNames.add(matchingName);
            for (const impl of this.availableResources[matchingName] ?? []) {
              if (impl.start && this.registry) await impl.start(this.registry);
            }
          }
        }
      } else {
        if (!this.activeResourceNames.has(name)) {
          this.activeResourceNames.add(name);
          for (const impl of this.availableResources[name] ?? []) {
            if (impl.start && this.registry) await impl.start(this.registry);
          }
        }
      }
    }
  }

  async disableResources(...names: string[] | string[][]): Promise<void> {
    for (const name of (names as string[]).flat()) {
      if (name === "root") {
        throw new Error("Cannot deactivate root context");
      }

      if (name.endsWith("*")) {
        const prefix = name.slice(0, -1);
        const matchingNames = Array.from(this.activeResourceNames).filter((resourceName) => resourceName.startsWith(prefix));
        for (const matchingName of matchingNames) {
          if (matchingName !== "root") {
            this.activeResourceNames.delete(matchingName);
            for (const impl of this.availableResources[matchingName] ?? []) {
              if (impl.stop && this.registry) await impl.stop(this.registry);
            }
          }
        }
      } else {
        if (this.activeResourceNames.has(name)) {
          this.activeResourceNames.delete(name);
          for (const impl of this.availableResources[name] ?? []) {
            if (impl.stop && this.registry) await impl.stop(this.registry);
          }
        }
      }
    }
  }

  async setEnabledResources(...names: string[] | string[][]): Promise<void> {
    for (const name of this.activeResourceNames) {
      if (!(names as string[]).includes(name)) {
        await this.disableResources(name);
      }
    }
    for (const name of names as string[]) {
      if (!this.activeResourceNames.has(name)) {
        await this.enableResources(name);
      }
    }
  }

  getAvailableResourceNames(): string[] {
    return Object.keys(this.availableResources);
  }

  getEnabledResourceNames(): string[] {
    return Array.from(this.activeResourceNames);
  }

  getActiveResources(): TokenRingResource[] {
    const ret: TokenRingResource[] = [];
    for (const name of this.activeResourceNames) {
      for (const impl of this.availableResources[name] ?? []) {
        ret.push(impl);
      }
    }
    return ret;
  }

  getFirstResourceByType<T extends TokenRingResource>(type: abstract new (...args: any[]) => T): T | undefined {
    return this.getResourcesByType(type)?.[0];
  }

  getResourcesByType<T extends TokenRingResource>(type: abstract new (...args: any[]) => T): T[] {
    const ret: T[] = [];
    for (const name of this.activeResourceNames) {
      for (const impl of this.availableResources[name] ?? []) {
        if (impl instanceof type) {
          ret.push(impl as T);
        }
      }
    }
    return ret;
  }
}
