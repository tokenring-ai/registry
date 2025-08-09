export const name: string;
export const description: string;
export const version: string;

export class Service {
  name: string;
  description: string;
  start(registry: Registry): Promise<void>;
  stop(registry: Registry): Promise<void>;
  status(registry: Registry): Promise<any>;
  getMemories?(registry: Registry): AsyncGenerator<any>;
  getAttentionItems?(registry: Registry): AsyncGenerator<any>;
}

export class Resource {
  name: string;
  description: string;
  constructor(params?: { name?: string; description?: string });
  start(registry: Registry): Promise<void>;
  stop(registry: Registry): Promise<void>;
  status(registry: Registry): Promise<any>;
}

export class Registry {
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

  getFirstServiceByType<T extends Service>(type: new () => T): T | undefined;
  requireFirstServiceByType<T extends Service>(type: new () => T): T;
}
