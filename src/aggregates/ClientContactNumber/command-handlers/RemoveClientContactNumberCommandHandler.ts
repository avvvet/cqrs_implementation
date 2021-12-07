import {ClientContactNumberRemovedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ClientContactNumberRepository} from '../ClientContactNumberRepository';
import {ClientContactNumberCommandHandlerInterface} from '../types/ClientContactNumberCommandHandlerInterface';
import {RemoveClientContactNumberCommandDataInterface} from '../types/CommandDataTypes';
import {ClientContactNumberCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';
import {ValidationError} from 'a24-node-error-utils';

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

    if (!aggregateClientContactNumber.isClientContactNumberIdExists(commandData._id)) {
      throw new ValidationError('Not allowed. Client Contact number not found', [
        {
          code: 'CONTACT_NUMBER_NOT_FOUND',
          message: `Client contact number id '${commandData._id}' not found.`,
          path: ['_id']
        }
      ]);
    } else if (aggregateClientContactNumber.isClientContactNumberRemoved(commandData._id)) {
      throw new ValidationError('Not allowed. Client Contact number already removed', [
        {
          code: 'CONTACT_NUMBER_ALREADY_REMOVED',
          message: `Client contact number id '${commandData._id}' already removed.`,
          path: ['_id']
        }
      ]);
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
