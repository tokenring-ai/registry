import packageJSON from './package.json' with { type: 'json' };
export const name = packageJSON.name;
export const version = packageJSON.version;
export const description = packageJSON.description;

export { default as Registry } from "./Registry.ts";
export { default as Resource } from "./Resource.ts";
export { default as Service } from "./Service.ts";
export { default as ServiceRegistry } from "./ServiceRegistry.ts";


declare class Service {
  name: string;
  description: string;
  start(registry: Registry): Promise<void>;
  stop(registry: Registry): Promise<void>;
  status(registry: Registry): Promise<any>;
  getMemories?(registry: Registry): AsyncGenerator<any>;
  getAttentionItems?(registry: Registry): AsyncGenerator<any>;
}

declare class Resource {
  name: string;
  description: string;
  constructor(params?: { name?: string; description?: string });
  start(registry: Registry): Promise<void>;
  stop(registry: Registry): Promise<void>;
  status(registry: Registry): Promise<any>;
}

declare class Registry {
  availablePackages: Set<any>;
  started: boolean;
  registry: Registry;
  services: any;
  resources: any;
  tools: any;
  chatCommands: any;

  start(): Promise<void>;
  stop(): Promise<void>;

  addPackages(...packages: any[]): Promise<void>;
  removePackages(...packages: any[]): Promise<void>;

  getPackageNames(): string[];
  getPackages(): any[];

  getFirstServiceByType<T extends Service>(type: abstract new (...args: any[]) => T): T | undefined;
  requireFirstServiceByType<T extends Service>(type: abstract new (...args: any[]) => T): T;
}
