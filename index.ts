export { default as Registry } from "./Registry.ts";
export { default as Resource } from "./Resource.ts";
export { default as Service } from "./Service.ts";

export const name: string = "@token-ring/registry";
export const description: string =
	"Registry system for managing tools, resources, and resources";
export const version: string = "0.1.0";


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
  registry: any;
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
