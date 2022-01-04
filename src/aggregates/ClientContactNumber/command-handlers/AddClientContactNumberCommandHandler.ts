import {ClientContactNumberAddedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ClientContactNumberRepository} from '../ClientContactNumberRepository';
import {ClientContactNumberCommandHandlerInterface} from '../types/ClientContactNumberCommandHandlerInterface';
import {AddClientContactNumberCommandDataInterface} from '../types/CommandDataTypes';
import {ClientContactNumberCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';
import {ContactNumberSettingRepository} from '../../ContactNumberSetting';
import {ValidationError} from 'a24-node-error-utils';

/**
 * Class responsible for handling add client contact number command
 */
export class AddClientContactNumberCommandHandler implements ClientContactNumberCommandHandlerInterface {
  public commandType = ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER;

  constructor(private clientContactNumberRepository: ClientContactNumberRepository) {}

  async execute(clientId: string, commandData: AddClientContactNumberCommandDataInterface): Promise<void> {
    const aggregateClientContactNumber = await this.clientContactNumberRepository.getAggregate(clientId);
    let eventId = aggregateClientContactNumber.getLastEventId();
    const aggregateId = aggregateClientContactNumber.getId();

    await aggregateClientContactNumber.validateAddClientContactNumberInvariants(
      commandData.type_id,
      commandData.contact_number
    );

    await this.clientContactNumberRepository.save([
      {
        type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
        aggregate_id: aggregateId,
        data: {
          _id: commandData._id,
          type_id: commandData.type_id,
          contact_number: commandData.contact_number
        } as ClientContactNumberAddedEventStoreDataInterface,
        sequence_id: ++eventId
      }
    ]);
  }
}
