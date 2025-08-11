// Resource base class in TypeScript

export type TokenRingRegistry = import("./Registry.ts").default;

export default class Resource {
  name!: string|undefined;
  description!: string|undefined;

  constructor({ name, description }: { name?: string; description?: string } = {}) {
    this.name ??= name;
    this.description ??= description;
  }

  async start(_registry: TokenRingRegistry): Promise<void> {}
  async stop(_registry: TokenRingRegistry): Promise<void> {}
  async status(_registry: TokenRingRegistry): Promise<any> {
    throw new Error(`This service does not implement a status method.`);
  }
}
