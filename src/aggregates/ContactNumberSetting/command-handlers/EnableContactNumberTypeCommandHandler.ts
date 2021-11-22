import {ContactNumberTypeEnabledEventStoreDataInterface} from 'EventStoreDataTypes/ContactNumberTypeEnabledEventStoreDataInterface';
import {ContactNumberSettingRepository} from '../ContactNumberSettingRepository';
import {EnableContactNumberTypeCommandDataInterface} from '../types/CommandDataTypes';
import {ContactNumberSettingCommandHandlerInterface} from '../types/ContactNumberSettingCommandHandlerInterface';
import {ContactNumberSettingCommandEnum} from '../types';
import {EventsEnum} from '../../../Events';

/**
 * Class responsible for handling enable contact number type command
 */
export class EnableContactNumberTypeCommandHandler implements ContactNumberSettingCommandHandlerInterface {
  public commandType = ContactNumberSettingCommandEnum.ENABLE_CONTACT_NUMBER_TYPE;

  constructor(private contactNumberSettingRepository: ContactNumberSettingRepository) {}

  async execute(commandData: EnableContactNumberTypeCommandDataInterface): Promise<void> {
    const aggregate = await this.contactNumberSettingRepository.getAggregate();
    const eventId = aggregate.getLastEventId();
    
    if (!aggregate.canEnableContactNumberType(commandData._id)) {
      return;
    }
    
  
    await this.contactNumberSettingRepository.save([
      {
        type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
        aggregate_id: aggregate.getId(),
        data: commandData as ContactNumberTypeEnabledEventStoreDataInterface,
        sequence_id: eventId + 1
      }
    ]);
  }
}