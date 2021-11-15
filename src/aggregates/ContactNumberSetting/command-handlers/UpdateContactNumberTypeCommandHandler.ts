import {ContactNumberTypeUpdatedEventStoreDataInterface} from 'EventStoreDataTypes/ContactNumberTypeUpdatedEventStoreDataInterface';
import {ContactNumberSettingRepository} from '../ContactNumberSettingRepository';
import {UpdateContactNumberTypeCommandDataInterface} from '../types/CommandDataTypes/UpdateContactNumberTypeCommandDataInterface';
import {ContactNumberSettingCommandHandlerInterface} from '../types/ContactNumberSettingCommandHandlerInterface';
import {ContactNumberSettingCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';

/**
 * Class responsible for handling update contact number type command
 */
export class UpdateContactNumberTypeCommandHandler implements ContactNumberSettingCommandHandlerInterface {
  public commandType = ContactNumberSettingCommandEnum.UPDATE_CONTACT_NUMBER_TYPE;

  constructor(private contactNumberSettingRepository: ContactNumberSettingRepository) {}

  async execute(commandData: UpdateContactNumberTypeCommandDataInterface): Promise<void> {
    const aggregate = await this.contactNumberSettingRepository.getAggregate();

    await aggregate.validateUpdateContactNumberType(commandData);
    let eventId = aggregate.getLastEventId();

    await this.contactNumberSettingRepository.save([
      {
        type: EventsEnum.CONTACT_NUMBER_TYPE_UPDATED,
        aggregate_id: aggregate.getId(),
        data: commandData as ContactNumberTypeUpdatedEventStoreDataInterface,
        sequence_id: ++eventId
      }
    ]);
  }
}
