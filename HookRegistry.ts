import {Registry} from "./index.js";
import Service from "./Service.ts";

export type HookConfig = {
  name: string;
  packageName: string;
  description: string;
  beforeChatCompletion?: HookCallback;
  afterChatCompletion?: HookCallback;
  afterTesting?: HookCallback;
}
export type HookType = "afterChatCompletion" | "beforeChatCompletion";

export type HookCallback = (registry: Registry, ...args: any[]) => Promise<void> | void;

export default class HookRegistry extends Service {
  registry: Registry | null = null;
  private hooks: Record<string, HookConfig> = {};
  private enabledHooks: Set<string> = new Set();

  async start(registry: Registry): Promise<void> {
    this.registry = registry;
  }

  async stop(_registry: Registry): Promise<void> {
    this.enabledHooks.clear();
  }

  registerHook(config: HookConfig): void {
    this.hooks[config.name] = config;
  }

  unregisterHook(config: HookConfig): void {
    delete this.hooks[config.name];
  }

  getEnabledHooks(): HookConfig[] {
    return Array.from(this.enabledHooks).map((hookName) => this.hooks[hookName]);
  }

  getRegisteredHooks(): HookConfig[] {
    return Object.values(this.hooks);
  }

  async executeHooks(hookType: HookType, ...args: any[]): Promise<void> {
    for (const hook of this.getEnabledHooks()) {
      await (hook[hookType] as HookCallback)?.(this.registry as Registry, ...args);
    }
  }

  enableHook(hookName: string): void {
    if (this.hooks[hookName]) {
      this.enabledHooks.add(hookName);
    } else {
      throw new Error(`Hook ${hookName} not found`);
    }
  }

  disableHook(hookName: string): void {
    if (this.hooks[hookName]) {
      this.enabledHooks.delete(hookName);
    } else {
      throw new Error(`Hook ${hookName} not found`);
    }
  }

  isHookEnabled(hookName: string): boolean {
    return this.enabledHooks.has(hookName);
  }
}