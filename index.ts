import packageJSON from './package.json' with {type: 'json'};

export const name = packageJSON.name;
export const version = packageJSON.version;
export const description = packageJSON.description;

export {default as Registry} from "./Registry.ts";
export {default as Resource} from "./Resource.ts";
export {default as Service} from "./Service.ts";
export {default as ServiceRegistry} from "./ServiceRegistry.ts";
export type {TokenRingPackage} from "./Registry.ts";


import type { MemoryItemMessage, AttentionItemMessage } from "./Service.ts";
import type { TokenRingPackage } from "./Registry.ts";
import type ServiceRegistry from "./ServiceRegistry.ts";
import type ResourceRegistry from "./ResourceRegistry.ts";
import type ToolRegistry from "./ToolRegistry.ts";
import type ChatCommandRegistry from "./ChatCommandRegistry.ts";

declare class Service {
  name: string;
  description: string;

  start(registry: Registry): Promise<void>;

  stop(registry: Registry): Promise<void>;

  status(registry: Registry): Promise<unknown>;

  getMemories?(registry: Registry): AsyncGenerator<MemoryItemMessage>;

  getAttentionItems?(registry: Registry): AsyncGenerator<AttentionItemMessage>;
}

declare class Resource {
  name: string;
  description: string;

  constructor(params?: { name?: string; description?: string });

  start(registry: Registry): Promise<void>;

  stop(registry: Registry): Promise<void>;

  status(registry: Registry): Promise<unknown>;
}

declare class Registry {
  availablePackages: Set<TokenRingPackage>;
  started: boolean;
  registry: Registry;
  services: ServiceRegistry;
  resources: ResourceRegistry;
  tools: ToolRegistry;
  chatCommands: ChatCommandRegistry;

  start(): Promise<void>;

  stop(): Promise<void>;

  addPackages(...packages: TokenRingPackage[]): Promise<void>;

  removePackages(...packages: TokenRingPackage[]): Promise<void>;

  getPackageNames(): string[];

  getPackages(): TokenRingPackage[];

  getFirstServiceByType<T extends Service>(type: abstract new (...args: any[]) => T): T | undefined;

  requireFirstServiceByType<T extends Service>(type: abstract new (...args: any[]) => T): T;
}