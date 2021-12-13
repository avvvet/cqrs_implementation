import {ClientContactNumberRemovedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ClientContactNumberRepository} from '../ClientContactNumberRepository';
import {ClientContactNumberCommandHandlerInterface} from '../types/ClientContactNumberCommandHandlerInterface';
import {RemoveClientContactNumberCommandDataInterface} from '../types/CommandDataTypes';
import {ClientContactNumberCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';
import {ResourceNotFoundError} from 'a24-node-error-utils';

/**
 * Class responsible for handling remove client contact number command
 */
export class RemoveClientContactNumberCommandHandler implements ClientContactNumberCommandHandlerInterface {
  public commandType = ClientContactNumberCommandEnum.REMOVE_CLIENT_CONTACT_NUMBER;

  constructor(private clientContactNumberRepository: ClientContactNumberRepository) {}

  async execute(clientId: string, commandData: RemoveClientContactNumberCommandDataInterface): Promise<void> {
    const aggregateClientContactNumber = await this.clientContactNumberRepository.getAggregate(clientId);
    const eventId = aggregateClientContactNumber.getLastEventId();
    const aggregateId = aggregateClientContactNumber.getId();

    if (!aggregateClientContactNumber.clientContactNumberIdExists(commandData._id)) {
      throw new ResourceNotFoundError('Not allowed. Client Contact number not found');
    }

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
