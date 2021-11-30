import {ContactNumberTypeDisabledEventStoreDataInterface} from 'EventStoreDataTypes';
import {ContactNumberSettingRepository} from '../ContactNumberSettingRepository';
import {DisableContactNumberTypeCommandDataInterface} from '../types/CommandDataTypes';
import {ContactNumberSettingCommandHandlerInterface} from '../types/ContactNumberSettingCommandHandlerInterface';
import {ContactNumberSettingCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';

/**
 * Class responsible for handling disable contact number type command
 */
export class DisableContactNumberTypeCommandHandler implements ContactNumberSettingCommandHandlerInterface {
  public commandType = ContactNumberSettingCommandEnum.DISABLE_CONTACT_NUMBER_TYPE;

  constructor(private contactNumberSettingRepository: ContactNumberSettingRepository) {}

  async execute(commandData: DisableContactNumberTypeCommandDataInterface): Promise<void> {
    const aggregate = await this.contactNumberSettingRepository.getAggregate();
    const eventId = aggregate.getLastEventId();

    if (!aggregate.canDisableContactNumberType(commandData._id)) {
      return;
    }

    await this.contactNumberSettingRepository.save([
      {
        type: EventsEnum.CONTACT_NUMBER_TYPE_DISABLED,
        aggregate_id: aggregate.getId(),
        data: commandData as ContactNumberTypeDisabledEventStoreDataInterface,
        sequence_id: eventId + 1
      }
    ]);
  }
}
