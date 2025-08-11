// Base Service class in TypeScript
// Keep .ts in import specifiers for NodeNext ESM compatibility

export type MemoryItem = {
  role: string;
  content: string;
};

export type AttentionItem = {
  role: string;
  content: string;
};

// The registry type is imported via the path with .ts specifier
// TypeScript will resolve to .ts during build due to allowImportingTsExtensions
export type TokenRingRegistry = import("./Registry.ts").default;

export default class Service {
  name: string = "The Subclass should have set this";
  description: string = "The Subclass should have set this";

  async start(_registry: TokenRingRegistry): Promise<void> {}
  async stop(_registry: TokenRingRegistry): Promise<void> {}

  async status(_registry: TokenRingRegistry): Promise<any> {
    throw new Error(`This service does not implement a status method.`);
  }

  async *getMemories(_registry: TokenRingRegistry): AsyncGenerator<MemoryItem> {}
  async *getAttentionItems(
    _registry: TokenRingRegistry,
  ): AsyncGenerator<AttentionItem> {}
}
