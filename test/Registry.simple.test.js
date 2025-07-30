import { describe, expect, it } from "vitest";
import Registry from "../Registry.js";

describe("Registry Basic Tests", () => {
	it("should create a registry instance", () => {
		const registry = new Registry();
		expect(registry).toBeInstanceOf(Registry);
		expect(registry.availablePackages).toBeInstanceOf(Set);
	});

	it("should have service, resource, tool, and chat command registries", () => {
		const registry = new Registry();

		expect(registry.services).toBeDefined();
		expect(registry.resources).toBeDefined();
		expect(registry.tools).toBeDefined();
		expect(registry.chatCommands).toBeDefined();
	});
});
