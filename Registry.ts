import ChatCommandRegistry from "./ChatCommandRegistry.ts";
import HookRegistry, {HookConfig} from "./HookRegistry.ts";
import {Registry} from "./index.js";
import ResourceRegistry from "./ResourceRegistry.ts";
import ServiceRegistry from "./ServiceRegistry.ts";
import ToolRegistry, {TokenRingToolDefinition} from "./ToolRegistry.ts";

type TokenRingChatCommand = import("./ChatCommandRegistry.ts").TokenRingChatCommand;
type TokenRingService = import("./Service.ts").default;

export type TokenRingPackage = {
  name: string;
  version: string;
  description: string;
  start?: (registry: Registry) => Promise<void>;
  stop?: (registry: Registry) => Promise<void>;
  tools?: Record<string, TokenRingToolDefinition>;
  chatCommands?: Record<string, TokenRingChatCommand>;
  hooks?: Record<string, Omit<Omit<HookConfig, "name">, "packageName">>;
  [key: string]: unknown;
};

export default class TokenRingRegistry {
  availablePackages: Set<TokenRingPackage> = new Set();
  started: boolean = false;

  services: ServiceRegistry = new ServiceRegistry();
  resources: ResourceRegistry = new ResourceRegistry();
  tools: ToolRegistry = new ToolRegistry();
  chatCommands: ChatCommandRegistry = new ChatCommandRegistry();
  hooks: HookRegistry = new HookRegistry();

  async start(): Promise<void> {
    for (const pkg of this.availablePackages) {
      if (pkg.start) await pkg.start(this);
    }

    await Promise.all([
      this.services.start(this),
      this.resources.start(this),
      this.tools.start(this),
      this.hooks.start(this),
    ]);
  }

  async stop(): Promise<void> {
    await Promise.all([
      this.services.stop(this),
      this.resources.stop(this),
      this.tools.stop(this),
      this.hooks.stop(this),
    ]);

    for (const pkg of this.availablePackages) {
      if (pkg.stop) await pkg.stop(this);
    }
  }

  async addPackages(...packages: (TokenRingPackage | TokenRingPackage[])[]): Promise<void> {
    for (const pkg of (packages as TokenRingPackage[]).flat()) {
      this.availablePackages.add(pkg);
      if (this.started) await pkg.start?.(this);

      if (pkg.tools) {
        for (const toolName in pkg.tools) {
          await this.tools.addTool({
            ...pkg.tools[toolName],
            packageName: pkg.name,
          });
        }
      }

      if (pkg.chatCommands) {
        for (const commandName in pkg.chatCommands) {
          this.chatCommands.addCommand(commandName, pkg.chatCommands[commandName]);
        }
      }

      if (pkg.hooks) {
        for (const name in pkg.hooks) {
          this.hooks.registerHook({
            name,
            packageName: pkg.name,
            ...pkg.hooks[name],
          });
        }
      }
    }
  }

  async removePackages(...packages: (TokenRingPackage | TokenRingPackage[])[]): Promise<void> {
    for (const pkg of (packages as TokenRingPackage[]).flat()) {
      this.availablePackages.delete(pkg);
      if (this.started) await pkg.stop?.(this);
    }
  }

  getPackageNames(): string[] {
    return this.getPackages().map((pkg) => pkg.name);
  }

  getPackages(): TokenRingPackage[] {
    return Array.from(this.availablePackages);
  }

  getFirstServiceByType<T extends TokenRingService>(type: abstract new (...args: any[]) => T): T | undefined {
    return this.services.getServicesByType(type)?.[0];
  }

  requireFirstServiceByType<T extends TokenRingService>(type: abstract new (...args: any[]) => T): T {
    const ret = this.services.getFirstServiceByType(type);
    if (!ret) throw new Error(`Cannot find a context of type: ${type.name ?? type}`);
    return ret as T;
  }
}
