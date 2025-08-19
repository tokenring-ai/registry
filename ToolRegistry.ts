import {Registry} from "./index.js";
import Service from "./Service.ts";


export type TokenRingToolDefinition = {
  name: string;
  description: string;
  execute: (input: object, registry: Registry) => Promise<string | object>;
  inputSchema: import("zod").ZodTypeAny;
  start?: (registry: Registry) => Promise<void>;
  stop?: (registry: Registry) => Promise<void>;
};
export type TokenRingTool = {
  packageName: string;
} & TokenRingToolDefinition;

export default class ToolRegistry extends Service {
  availableTools: Record<string, TokenRingTool> = {};
  activeToolNames: Set<string> = new Set();
  registry: Registry | null = null;

  async start(registry: Registry): Promise<void> {
    this.registry = registry;
  }

  async stop(_registry: Registry): Promise<void> {
    await this.disableTools(...this.activeToolNames);
  }

  async addTool(definition: TokenRingTool): Promise<void> {
    this.availableTools[definition.name] = definition;
  }

  async enableTools(...names: string[] | string[][]): Promise<void> {
    for (const name of (names as string[]).flat()) {
      if (!this.availableTools[name]) {
        throw new Error(`Tool ${name} not found`);
      }

      if (!this.activeToolNames.has(name)) {
        this.activeToolNames.add(name);
        const tool = this.availableTools[name];
        if (tool?.start && this.registry) await tool.start(this.registry);
      }
    }
  }

  async disableTools(...names: string[] | string[][]): Promise<void> {
    for (const name of names.flat()) {
      if (!this.availableTools[name]) {
        throw new Error(`Tool ${name} not found`);
      }
      if (this.activeToolNames.has(name)) {
        this.activeToolNames.delete(name);
        const tool = this.availableTools[name];
        if (tool?.stop && this.registry) await tool.stop(this.registry);
      }
    }
  }

  async setEnabledTools(...names: string[] | string[][]): Promise<void> {
    const flatNames = names.flat();
    for (const name of this.activeToolNames) {
      if (!flatNames.includes(name)) {
        await this.disableTools(name);
      }
    }
    for (const name of flatNames) {
      if (!this.activeToolNames.has(name)) {
        await this.enableTools(name);
      }
    }
  }

  getAvailableToolNames(): string[] {
    return Object.keys(this.availableTools);
  }

  getToolsByPackage(): Record<string, string[]> {
    const toolsByPackage: Record<string, string[]> = {};

    for (const [toolName, toolDef] of Object.entries(this.availableTools)) {
      const packageName = toolDef.packageName || "unknown";
      if (!toolsByPackage[packageName]) {
        toolsByPackage[packageName] = [];
      }
      toolsByPackage[packageName].push(toolName);
    }

    for (const packageName in toolsByPackage) {
      toolsByPackage[packageName].sort((a, b) => a.localeCompare(b));
    }

    return toolsByPackage;
  }

  getEnabledToolNames(): string[] {
    return Array.from(this.activeToolNames);
  }

  getActiveTools(): TokenRingTool[] {
    return Array.from(this.iterateActiveTools());
  }

  * iterateActiveTools(): Generator<TokenRingTool, void, unknown> {
    for (const name of this.activeToolNames) {
      const tool = this.availableTools[name];
      if (tool) yield tool;
    }
  }

  getToolByName(name: string): TokenRingTool | undefined {
    return this.availableTools[name];
  }
}
