import {ClientContactNumberAddedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ClientContactNumberRepository} from '../ClientContactNumberRepository';
import {ClientContactNumberCommandHandlerInterface} from '../types/ClientContactNumberCommandHandlerInterface';
import {AddClientContactNumberCommandDataInterface} from '../types/CommandDataTypes';
import {ClientContactNumberCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';
import {ContactNumberSettingRepository} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ValidationError} from 'a24-node-error-utils';

/**
 * Class responsible for handling add client contact number command
 */
export class AddClientContactNumberCommandHandler implements ClientContactNumberCommandHandlerInterface {
  public commandType = ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER;

  constructor(
    private clientContactNumberRepository: ClientContactNumberRepository,
    private contactNumberSettingRepository: ContactNumberSettingRepository
  ) {}

  async execute(clientId: string, commandData: AddClientContactNumberCommandDataInterface): Promise<void> {
    const aggregateClientContactNumber = await this.clientContactNumberRepository.getAggregate(clientId);
    const aggregateContactNumberSetting = await this.contactNumberSettingRepository.getAggregate();
    let eventId = aggregateClientContactNumber.getLastEventId();
    const aggregateId = aggregateClientContactNumber.getId();

    if (!aggregateContactNumberSetting.isContactNumberTypeExists(commandData.type_id)) {
      throw new ValidationError('Not allowed. Contact number type not exists', [
        {
          code: 'CONTACT_NUMBER_TYPE_NOT_EXIST',
          message: `contact number type '${commandData.type_id}' not exists.`,
          path: ['name']
        }
      ]);
    } else if (!aggregateContactNumberSetting.isContactNumberTypeEnabled(commandData.type_id)) {
      throw new ValidationError('Not allowed. Contact number type is disabled', [
        {
          code: 'CONTACT_NUMBER_TYPE_DISABLED',
          message: `contact number type '${commandData.type_id}' is disabled.`,
          path: ['name']
        }
      ]);
    } else if (aggregateClientContactNumber.isClientContactNumberExists(commandData.contact_number)) {
      throw new ValidationError('Not allowed. Client Contact number exists', [
        {
          code: 'CONTACT_NUMBER_EXISTS',
          message: `name '${commandData.contact_number}' already exists.`,
          path: ['name']
        }
      ]);
    }

    await this.clientContactNumberRepository.save([
      {
        type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
        aggregate_id: aggregateId,
        data: {
          _id: commandData._id,
          client_id: clientId,
          type_id: commandData.type_id,
          contact_number: commandData.contact_number
        } as ClientContactNumberAddedEventStoreDataInterface,
        sequence_id: ++eventId
      }
    ]);
  }
}
