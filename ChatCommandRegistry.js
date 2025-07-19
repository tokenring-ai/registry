/**
 * @typedef {Object} TokenRingChatCommand
 * @property {string} [name] - The name of the chat command
 * @property {string} description - Chat Command Description
 * @property {function(remainder: string,registry: TokenRingRegistry): Promise<string>} execute - Called when the chat command is executed
 * @property {function(): string} help - Returns a help message for the command
 * @property {*} [:string] - Any additional properties
 */

export default class ChatCommandRegistry {
	name = "ChatCommandRegistry";
	description = "Provides a registry of chat commands that can be run";
	commands = {};

	/**
	 * Adds a tool with the specified name and properties.
	 * @param {string} name - The name of the tool.
	 * @param {TokenRingChatCommand} tool - The tool configuration object
	 */
	async addCommand(name, { description, execute, help }) {
		this.commands[name] = { name, description, execute, help };
	}

	/**
	 * Removes a command from the registry.
	 * @param {string} name - The name of the command to remove.
	 * @returns {boolean} - True if the command was removed, false if it didn't exist.
	 */
	removeCommand(name) {
		if (this.commands[name]) {
			delete this.commands[name];
			return true;
		}
		return false;
	}

	/**
	 * Gets a specific command from the registry by name.
	 * @param {string} commandName - The name of the command to retrieve.
	 * @returns {TokenRingChatCommand|undefined} The command object if found, undefined otherwise.
	 */
	getCommand(commandName) {
		return this.commands[commandName];
	}

	/**
	 * Gets all registered commands.
	 * @returns {Object<string,TokenRingChatCommand>} An object containing all registered commands.
	 */
	getCommands() {
		return this.commands;
	}
}
