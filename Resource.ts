// Resource base class in TypeScript


import {Registry} from "./index.js";

export default class Resource {
  name!: string | undefined;
  description!: string | undefined;

  constructor({name, description}: { name?: string; description?: string } = {}) {
    this.name ??= name;
    this.description ??= description;
  }

  async start(_registry: Registry): Promise<void> {
  }

  async stop(_registry: Registry): Promise<void> {
  }

  async status(_registry: Registry): Promise<any> {
    throw new Error(`This service does not implement a status method.`);
  }
}
