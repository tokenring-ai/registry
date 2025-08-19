# @token-ring/registry

The @token-ring/registry package provides the core runtime registry used across the Token Ring ecosystem. It coordinates
four key areas:

- Services: Long‑lived components with lifecycle hooks (start/stop/status, optional memory/attention streams).
- Resources: Named, enable/disable‑able capabilities that can have multiple implementations per name.
- Tools: Discrete, invokable actions (with optional Zod parameter schemas) that can be enabled/disabled and have
  lifecycle hooks.
- Chat Commands: Simple commands available to interactive chat UIs.

On top of these, the Registry can load packages that declare tools and chat commands and expose optional start/stop
hooks.

## Install

This package is part of the monorepo and is typically consumed by other Token Ring packages. If used standalone:

- Package name: `@token-ring/registry`
- Exports ESM modules.

## Exports

- Registry: Main orchestrator for packages, services, resources, tools, and chat commands.
- Service: Base class for long‑lived services with lifecycle and optional memory/attention iterators.
- Resource: Base class for resources that can be enabled/disabled.
- ServiceRegistry: Manages Service instances.

Additional internal types/classes used by Registry:

- ResourceRegistry: Manages named resources and their enable/disable state (with wildcard support).
- ToolRegistry: Manages tools and their enable/disable state.
- ChatCommandRegistry: Manages chat commands.

See src files in this package for full type signatures.

## Quick start

```ts
import {Registry, Service} from "@token-ring/registry";

// 1) Create a registry
const registry = new Registry();

// 2) Add a service
class MyService extends Service {
  name = "my-service";
  description = "Demo service";

  async start(registry: Registry) {
    // initialize connections/resources
  }

  async stop(_registry: Registry) {
    // cleanup
  }
}

await registry.services.addServices(new MyService());

// 3) Register a tool directly (could also come from a package)
await registry.tools.addTool("sayHello", {
  description: "Greets a user",
  async execute(input: { name: string }, _registry) {
    return `Hello, ${input.name}!`;
  },
  // optional Zod schema: parameters: z.object({ name: z.string() })
  start: async (_reg) => {
  },
  stop: async (_reg) => {
  },
});

// 4) Enable a tool and start the registry
await registry.tools.enableTools("sayHello");
await registry.start();

// 5) Invoke a tool (typically invoked by higher‑level orchestrators)
const tool = registry.tools.getToolByName("sayHello");
const result = await tool?.execute?.({name: "World"}, registry);
console.log(result); // "Hello, World!"

// 6) Shutdown
await registry.stop();
```

## Packages

A Token Ring package can declare:

- start(registry): optional async hook, invoked on registry.start().
- stop(registry): optional async hook, invoked on registry.stop().
- tools: a map of tool definitions.
- chatCommands: a map of chat command definitions.

Example package object you can pass to registry.addPackages:

```ts
const demoPkg = {
  name: "@demo/tools",
  version: "1.0.0",
  description: "Demo tools",
  start: async (registry: Registry) => {
    // set up caches, connections, etc.
  },
  stop: async (registry: Registry) => {
    // clean up
  },
  tools: {
    greet: {
      description: "Greets",
      async execute({name}: { name: string }) {
        return `Hi ${name}`;
      },
    },
  },
  chatCommands: {
    help: {
      description: "Show help",
      execute: () => "Usage...",
      help: () => ["/help - show commands"],
    },
  },
} as const;

await registry.addPackages(demoPkg);
```

## Managing services

- Add: registry.services.addServices(serviceA, serviceB)
- Remove: registry.services.removeServices(service)
- Lookup:
- getServiceNames()
- getServicesByType(Class)
- getFirstServiceByType(Class)
- requireFirstServiceByType(Class) on Registry
- Lifecycle: Services added before registry.start() are started when the registry starts; adding after start() will
  start them immediately.

## Managing resources

Resources are grouped under a name and can have multiple implementations per name. They are started/stopped when
enabled/disabled.

- Add implementations: registry.resources.addResource("fs", resourceImpl1, resourceImpl2)
- Enable/disable by name: enableResources("fs"), disableResources("fs")
- Wildcard enable/disable: enableResources("fs*"), disableResources("fs*")
- Set full set: setEnabledResources("fs", "net")
- Queries:
- getAvailableResourceNames()
- getEnabledResourceNames()
- getActiveResources()
- getResourcesByType(Class), getFirstResourceByType(Class)

## Managing tools

- Register: registry.tools.addTool(name, definition)
- Enable/disable: enableTools(name), disableTools(name)
- Bulk: setEnabledTools(...names)
- Inspect: getAvailableToolNames(), getEnabledToolNames(), getActiveTools(), getToolsByPackage()
- Lookup: getToolByName(name)

Tool definition shape (see ToolRegistry.ts):

- description?: string
- execute?: (input, registry) => Promise<string|object> | string | object
- parameters?: Zod schema (optional)
- start?: (registry) => Promise<void>
- stop?: (registry) => Promise<void>
- afterChatComplete?: (registry) => Promise<void> | void
- afterTestingComplete?: (registry) => Promise<void> | void

## Managing chat commands

- Add: registry.chatCommands.addCommand(name, { description, execute, help })
- Remove: registry.chatCommands.removeCommand(name)
- Lookup: getCommand(name), getCommands(), getAvailableCommandNames()

## Registry lifecycle

- start():
- Invokes package start hooks.
- Starts ServiceRegistry, ResourceRegistry, ToolRegistry.
- stop():
- Stops ServiceRegistry, ResourceRegistry, ToolRegistry.
- Invokes package stop hooks.

Helpers:

- addPackages(...pkgs), removePackages(...pkgs)
- getPackageNames(), getPackages()
- requireFirstServiceByType<T>(Class)

## Notes

- ESM only; import paths in this package use explicit .ts extensions internally to support NodeNext.
- Zod is optional for tool parameter validation; tools can be used without schemas.
- Tests in pkg/registry/test showcase typical usage and expected behaviors.
