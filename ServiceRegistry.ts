import {Registry} from "./index.js";

type TokenRingService = import("./Service.ts").default;

export default class ServiceRegistry {
  availableServices: Set<TokenRingService> = new Set();
  started: boolean = false;
  registry: Registry | null = null;

  async start(registry: Registry): Promise<void> {
    this.registry = registry;
    this.started = true;

    for (const service of this.availableServices) {
      if (service.start) await service.start(registry);
    }
  }

  async stop(registry: Registry): Promise<void> {
    for (const service of this.availableServices) {
      if (service.stop) await service.stop(registry);
    }
  }

  async addServices(
    ...services: (TokenRingService | TokenRingService[])[]
  ): Promise<void> {
    for (const service of (services as TokenRingService[]).flat()) {
      this.availableServices.add(service);
      if (this.started && this.registry) await service.start(this.registry);
    }
  }

  async removeServices(
    ...services: (TokenRingService | TokenRingService[])[]
  ): Promise<void> {
    for (const service of (services as TokenRingService[]).flat()) {
      this.availableServices.delete(service);
      if (this.started && this.registry) await service.stop(this.registry);
    }
  }

  getServiceNames(): string[] {
    return this.getServices().map((service) => service.name);
  }

  getServices(): TokenRingService[] {
    return Array.from(this.availableServices);
  }

  getServicesByType<T extends TokenRingService>(type: abstract new (...args: any[]) => T): T[] {
    return Array.from(this.availableServices).filter(
      (service) => service instanceof type
    ) as T[];
  }

  getServicesByName(name: string): TokenRingService[] {
    return Array.from(this.availableServices).filter(
      (service) => service.name === name,
    );
  }

  getFirstServiceByType<T extends TokenRingService>(type: abstract new (...args: any[]) => T): T | undefined {
    return this.getServicesByType(type)?.[0];
  }

  requireFirstServiceByType<T extends TokenRingService>(type: abstract new (...args: any[]) => T): T {
    const ret = this.getFirstServiceByType(type);
    if (!ret) throw new Error(`Cannot find a service of type: ${type}`);
    return ret;
  }

  async* getMemories(): AsyncGenerator<any> {
    for (const service of this.getServices()) {
      if (service.getMemories) {
        yield* service.getMemories(this.registry as Registry);
      }
    }
  }

  async* getAttentionItems(): AsyncGenerator<any> {
    for (const service of this.getServices()) {
      if (service.getAttentionItems) {
        yield* service.getAttentionItems(this.registry as Registry);
      }
    }
  }
}
