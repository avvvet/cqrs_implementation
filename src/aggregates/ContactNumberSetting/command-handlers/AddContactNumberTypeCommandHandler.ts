import {ContactNumberTypeAddedEventStoreDataInterface} from 'EventStoreDataTypes';
import {ContactNumberTypeEnabledEventStoreDataInterface} from 'EventStoreDataTypes/ContactNumberTypeEnabedEventStoreDataInterface';
import {has} from 'lodash';
import {ContactNumberSettingRepository} from '../ContactNumberSettingRepository';
import {ContactNumberSettingCommandHandlerInterface} from '../types/ContactNumberSettingCommandHandlerInterface';
import {AddContactNumberTypeCommandDataInterface} from '../types/CommandDataTypes';
import {ContactNumberSettingCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';

/**
 * Class responsible for handling add contact number type command
 */
export class AddContactNumberTypeCommandHandler implements ContactNumberSettingCommandHandlerInterface {
  public commandType = ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE;

  constructor(private contactNumberSettingRepository: ContactNumberSettingRepository) {}

  async execute(commandData: AddContactNumberTypeCommandDataInterface): Promise<void> {
    const aggregate = await this.contactNumberSettingRepository.getAggregate();

    await aggregate.validateAddContactNumberType(commandData);
    let eventId = aggregate.getLastEventId();

    await this.contactNumberSettingRepository.save([
      {
        type: EventsEnum.CONTACT_NUMBER_TYPE_ADDED,
        aggregate_id: aggregate.getId(),
        data: {
          _id: commandData._id,
          name: commandData.name,
          order: has(commandData, 'order') ? commandData.order : 1
        } as ContactNumberTypeAddedEventStoreDataInterface,
        sequence_id: ++eventId
      },
      {
        type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
        aggregate_id: aggregate.getId(),
        data: {
          _id: commandData._id
        } as ContactNumberTypeEnabledEventStoreDataInterface,
        sequence_id: ++eventId
      }
    ]);
  }
}
