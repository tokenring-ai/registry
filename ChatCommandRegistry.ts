export type TokenRingRegistry = import("./Registry.ts").default;

export type TokenRingChatCommand = {
  name?: string;
  description: string;
  execute: (input: string, registry: TokenRingRegistry) => Promise<void | string> | void | string;
  help: () => string | string[];
  // allow arbitrary extras
  [key: string]: unknown;
};

export default class ChatCommandRegistry {
  name: string = "ChatCommandRegistry";
  description: string = "Provides a registry of chat commands that can be run";
  commands: Record<string, TokenRingChatCommand> = {};

  async addCommand(name: string, { description, execute, help }: TokenRingChatCommand): Promise<void> {
    this.commands[name] = { name, description, execute, help } as TokenRingChatCommand;
  }

  removeCommand(name: string): boolean {
    if (this.commands[name]) {
      delete this.commands[name];
      return true;
    }
    return false;
  }

  getCommand(commandName: string): TokenRingChatCommand | undefined {
    return this.commands[commandName];
  }

  getCommands(): Record<string, TokenRingChatCommand> {
    return this.commands;
  }

  getAvailableCommandNames(): string[] {
    return Object.keys(this.commands);
  }
}
