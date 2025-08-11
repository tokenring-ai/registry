import ChatCommandRegistry from "./ChatCommandRegistry.ts";
import ResourceRegistry from "./ResourceRegistry.ts";
import ServiceRegistry from "./ServiceRegistry.ts";
import ToolRegistry from "./ToolRegistry.ts";

export type TokenRingTool = import("./ToolRegistry.ts").TokenRingTool;
export type TokenRingChatCommand = import("./ChatCommandRegistry.ts").TokenRingChatCommand;
export type TokenRingService = import("./Service.ts").default;

export type TokenRingPackage = {
  name: string;
  version: string;
  description: string;
  start?: (registry: TokenRingRegistry) => Promise<void>;
  stop?: (registry: TokenRingRegistry) => Promise<void>;
  tools?: Record<string, TokenRingTool>;
  chatCommands?: Record<string, TokenRingChatCommand>;
  [key: string]: unknown;
};

export default class TokenRingRegistry {
  availablePackages: Set<TokenRingPackage> = new Set();
  started: boolean = false;
  registry: any = null;

  services: ServiceRegistry = new ServiceRegistry();
  resources: ResourceRegistry = new ResourceRegistry();
  tools: ToolRegistry = new ToolRegistry();
  chatCommands: ChatCommandRegistry = new ChatCommandRegistry();

  async start(): Promise<void> {
    for (const pkg of this.availablePackages) {
      if (pkg.start) await pkg.start(this);
    }

    await Promise.all([
      this.services.start(this),
      this.resources.start(this),
      this.tools.start(this),
    ]);
  }

  async stop(): Promise<void> {
    await Promise.all([
      this.services.stop(this),
      this.resources.stop(this),
      this.tools.stop(this),
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
          await this.tools.addTool(toolName, {
            ...pkg.tools[toolName],
            name: toolName,
            packageName: pkg.name,
          });
        }
      }

      if (pkg.chatCommands) {
        for (const commandName in pkg.chatCommands) {
          await this.chatCommands.addCommand(commandName, pkg.chatCommands[commandName]);
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

  getFirstServiceByType<T extends TokenRingService>(type: abstract new () => T): T | undefined {
    return this.services.getServicesByType(type as any)?.[0] as T | undefined;
  }

  requireFirstServiceByType<T extends TokenRingService>(type: abstract new () => T): T {
    const ret = this.services.getFirstServiceByType(type as any) as T | undefined;
    if (!ret) throw new Error(`Cannot find a context of type: ${type.name ?? (type as any)}`);
    return ret as T;
  }
}
