// Base Service class in TypeScript
// Keep .ts in import specifiers for NodeNext ESM compatibility

import { Registry } from "@token-ring/registry";

export type MemoryItemMessage = {
  role: string;
  content: string;
};

export type AttentionItemMessage = {
  role: string;
  content: string;
};

export default class Service {
  name: string = "The Subclass should have set this";
  description: string = "The Subclass should have set this";

  async start(_registry: Registry): Promise<void> {}
  async stop(_registry: Registry): Promise<void> {}

  async status(_registry: Registry): Promise<any> {
    throw new Error(`This service does not implement a status method.`);
  }

  async *getMemories(_registry: Registry): AsyncGenerator<MemoryItemMessage> {}
  async *getAttentionItems(
    _registry: Registry,
  ): AsyncGenerator<AttentionItemMessage> {}
}
