import {ContactNumberSettingCommandHandlerInterface} from './types/ContactNumberSettingCommandHandlerInterface';
import {ContactNumberSettingCommandInterface} from './types';

/**
 * Responsible for routing all contact number setting related commands to their corresponding handlers
 */
export class ContactNumberSettingCommandBus {
  private commandHandlers: ContactNumberSettingCommandHandlerInterface[] = [];

  /**
   * Add a command handler to the list of supported handlers
   */
  addHandler(commandHandler: ContactNumberSettingCommandHandlerInterface) {
    this.commandHandlers.push(commandHandler);
    return this;
  }

  /**
   * Execute the command by finding it's corresponding handler
   */
  async execute(command: ContactNumberSettingCommandInterface): Promise<void> {
    const commandHandler = this.commandHandlers.find((handler) => handler.commandType === command.type);

    if (!commandHandler) {
      throw new Error(`Command type:${command.type} is not supported`);
    }

    await commandHandler.execute(command.data);
  }
}
