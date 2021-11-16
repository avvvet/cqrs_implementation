import {ClientContactNumberCommandBus} from '../aggregates/ClientContactNumber/ClientContactNumberCommandBus';
import {ClientContactNumberRepository} from '../aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberWriteProjectionHandler} from '../aggregates/ClientContactNumber/ClientContactNumberWriteProjectionHandler';
import {AddClientContactNumberCommandHandler} from '../aggregates/ClientContactNumber/command-handlers/AddClientContactNumberCommandHandler';
import {EventRepository} from '../EventRepository';

/**
 * Factory class responsible for building a client Contact Number configured with supported command handlers
 */
export class ClientContactNumberCommandBusFactory {
  /**
   * Returns an instance of ClientContactNumberCommandBus with a list of supported command handlers configured
   */
  static getCommandBus(eventRepository: EventRepository): ClientContactNumberCommandBus {
    const clientContactNumberRepository = new ClientContactNumberRepository(
      eventRepository,
      new ClientContactNumberWriteProjectionHandler()
    );
    const commandBus = new ClientContactNumberCommandBus();

    commandBus.addHandler(new AddClientContactNumberCommandHandler(clientContactNumberRepository));
    return commandBus;
  }
}