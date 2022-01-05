import {ClientContactNumberRemovedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ClientContactNumberRepository} from '../ClientContactNumberRepository';
import {ClientContactNumberCommandHandlerInterface} from '../types/ClientContactNumberCommandHandlerInterface';
import {RemoveClientContactNumberCommandDataInterface} from '../types/CommandDataTypes';
import {ClientContactNumberCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';

/**
 * Class responsible for handling remove client contact number command
 */
export class RemoveClientContactNumberCommandHandler implements ClientContactNumberCommandHandlerInterface {
  public commandType = ClientContactNumberCommandEnum.REMOVE_CLIENT_CONTACT_NUMBER;

  constructor(private clientContactNumberRepository: ClientContactNumberRepository) {}

  async execute(clientId: string, commandData: RemoveClientContactNumberCommandDataInterface): Promise<void> {
    const aggregateClientContactNumber = await this.clientContactNumberRepository.getAggregate(clientId);

    await aggregateClientContactNumber.validateRemoveClientContactNumberInvariants(commandData._id);

    const eventId = aggregateClientContactNumber.getLastEventId();
    const aggregateId = aggregateClientContactNumber.getId();

    await this.clientContactNumberRepository.save([
      {
        type: EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED,
        aggregate_id: aggregateId,
        data: {
          _id: commandData._id
        } as ClientContactNumberRemovedEventStoreDataInterface,
        sequence_id: eventId + 1
      }
    ]);
  }
}
