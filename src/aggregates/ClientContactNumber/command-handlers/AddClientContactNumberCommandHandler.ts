import {ClientContactNumberAddedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ClientContactNumberRepository} from '../ClientContactNumberRepository';
import {ClientContactNumberCommandHandlerInterface} from '../types/ClientContactNumberCommandHandlerInterface';
import {AddClientContactNumberCommandDataInterface} from '../types/CommandDataTypes';
import {ClientContactNumberCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';

/**
 * Class responsible for handling add client contact number command
 */
export class AddClientContactNumberCommandHandler implements ClientContactNumberCommandHandlerInterface {
  public commandType = ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER;

  constructor(private clientContactNumberRepository: ClientContactNumberRepository) {}

  async execute(clientId: string, commandData: AddClientContactNumberCommandDataInterface): Promise<void> {
    const aggregate = await this.clientContactNumberRepository.getAggregate(clientId);
    let eventId = aggregate.getLastEventId();

    await this.clientContactNumberRepository.save([
      {
        type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
        aggregate_id: aggregate.getId(),
        data: {
          _id: commandData._id,
          client_id: clientId,
          type_id: commandData.type_id,
          number: commandData.number
        } as ClientContactNumberAddedEventStoreDataInterface,
        sequence_id: ++eventId
      }
    ]);
  }
}
