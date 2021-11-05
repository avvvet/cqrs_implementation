import {ClientContactNumberCommandHandlerInterface} from './types/ClientContactNumberCommandHandlerInterface';
import {ClientContactNumberCommandInterface} from './types';

/**
 * Responsible for routing all client contact number related commands to their corresponding handlers
 */
export class ClientContactNumberCommandBus {
  private commandHandlers: ClientContactNumberCommandHandlerInterface[] = [];

  /**
   * Add a command handler to the list of supported handlers
   */
  addHandler(commandHandler: ClientContactNumberCommandHandlerInterface): ClientContactNumberCommandBus {
    this.commandHandlers.push(commandHandler);
    return this;
  }

  /**
   * Execute the command by finding it's corresponding handler
   */
  async execute(clientId: string, command: ClientContactNumberCommandInterface): Promise<void> {
    const commandHandler = this.commandHandlers.find((handler) => handler.commandType === command.type);

    if (!commandHandler) {
      throw new Error(`Command type:${command.type} is not supported`);
    }

    await commandHandler.execute(clientId, command.data);
  }
}
