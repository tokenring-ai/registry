import { beforeEach, describe, expect, it } from "vitest";
import Registry from "../Registry.js";
import Resource from "../Resource.js";
import Service from "../Service.js";

// Mock service implementation for testing
class TestService extends Service {
	constructor(name = "test-service") {
		super();
		this.name = name;
		this.started = false;
		this.stopped = false;
	}

	async start() {
		this.started = true;
	}

	async stop() {
		this.stopped = true;
	}
}

// Mock resource implementation for testing
class TestResource extends Resource {
	constructor(name = "test-resource") {
		super();
		this.name = name;
		this.started = false;
		this.stopped = false;
	}

	async start() {
		this.started = true;
	}

	async stop() {
		this.stopped = true;
	}
}

// Mock package for testing
const createTestPackage = (name) => ({
	name: name,
	version: "1.0.0",
	description: `Test package ${name}`,
	start: async (_registry) => {},
	stop: async (_registry) => {},
	tools: {
		[`${name}Tool`]: {
			description: `Tool for ${name}`,
			execute: async (_params, _registry) => `Executed ${name} tool`,
			parameters: {},
		},
	},
	chatCommands: {
		[`${name}Command`]: {
			description: `Command for ${name}`,
			execute: async (_params, _registry) => `Executed ${name} command`,
		},
	},
});

describe("Registry Integration Tests", () => {
	let registry;

	beforeEach(() => {
		registry = new Registry();
	});

	describe("Package Management", () => {
		it("should add and remove packages", async () => {
			const pkg1 = createTestPackage("test1");
			const pkg2 = createTestPackage("test2");

			// Add packages
			await registry.addPackages(pkg1, pkg2);

			expect(registry.getPackageNames()).toEqual(["test1", "test2"]);
			expect(registry.getPackages()).toHaveLength(2);

			// Remove one package
			await registry.removePackages(pkg1);

			expect(registry.getPackageNames()).toEqual(["test2"]);
			expect(registry.getPackages()).toHaveLength(1);
		});

		it("should register tools and chat commands from packages", async () => {
			const pkg = createTestPackage("test");

			await registry.addPackages(pkg);

			// Check tools were registered
			const availableTools = registry.tools.getAvailableToolNames();
			expect(availableTools).toContain("testTool");

			// Check chat commands were registered
			const availableCommands =
				registry.chatCommands.getAvailableCommandNames();
			expect(availableCommands).toContain("testCommand");
		});
	});

	describe("Service Management", () => {
		it("should add and manage services", async () => {
			const service1 = new TestService("service1");
			const service2 = new TestService("service2");

			// Add services
			await registry.services.addServices(service1, service2);

			expect(registry.services.getServiceNames()).toEqual([
				"service1",
				"service2",
			]);

			// Get services by type
			const servicesByType = registry.services.getServicesByType(TestService);
			expect(servicesByType).toHaveLength(2);

			// Get first service by type
			const firstService = registry.services.getFirstServiceByType(TestService);
			expect(firstService.name).toBe("service1");
		});

		it("should start and stop services", async () => {
			const service = new TestService();

			await registry.services.addServices(service);

			// Start registry (which starts services)
			await registry.start();

			expect(service.started).toBe(true);

			// Stop registry (which stops services)
			await registry.stop();

			expect(service.stopped).toBe(true);
		});
	});

	describe("Resource Management", () => {
		it("should add and manage resources", async () => {
			const resource1 = new TestResource();
			const resource2 = new TestResource();

			// Add resources
			await registry.resources.addResource(
				"test-resource",
				resource1,
				resource2,
			);

			expect(registry.resources.getAvailableResourceNames()).toContain(
				"test-resource",
			);
		});

		it("should enable and disable resources", async () => {
			const resource = new TestResource();

			await registry.resources.addResource("test-resource", resource);

			// Enable resource
			await registry.resources.enableResources("test-resource");

			expect(registry.resources.getEnabledResourceNames()).toContain(
				"test-resource",
			);
			expect(registry.resources.getActiveResources()).toHaveLength(1);

			// Disable resource
			await registry.resources.disableResources("test-resource");

			expect(registry.resources.getEnabledResourceNames()).not.toContain(
				"test-resource",
			);
		});
	});

	describe("Tool Management", () => {
		it("should add and manage tools", async () => {
			const toolDefinition = {
				name: "test-tool",
				description: "A test tool",
				execute: async () => "tool result",
				parameters: {},
			};

			// Add tool
			await registry.tools.addTool("test-tool", toolDefinition);

			expect(registry.tools.getAvailableToolNames()).toContain("test-tool");

			// Get tool by name
			const tool = registry.tools.getToolByName("test-tool");
			expect(tool).toBeDefined();
			expect(tool.description).toBe("A test tool");
		});

		it("should enable and disable tools", async () => {
			const toolDefinition = {
				name: "test-tool",
				description: "A test tool",
				execute: async () => "tool result",
				parameters: {},
			};

			await registry.tools.addTool("test-tool", toolDefinition);

			// Enable tool
			await registry.tools.enableTools("test-tool");

			expect(registry.tools.getEnabledToolNames()).toContain("test-tool");
			expect(registry.tools.getActiveTools()).toHaveLength(1);

			// Disable tool
			await registry.tools.disableTools("test-tool");

			expect(registry.tools.getEnabledToolNames()).not.toContain("test-tool");
		});
	});
});
