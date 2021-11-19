import {ContactNumberSettingCommandEnum} from '../../../src/aggregates/ContactNumberSetting/types';
import {ContactNumberSettingCommandBusFactory} from '../../../src/factories/ContactNumberSettingCommandBusFactory';
import {AbstractScenario} from './AbstractScenario';

export class ContactNumberTypeScenario extends AbstractScenario {
  async createContactNumberType(id: string): Promise<void> {
    await ContactNumberSettingCommandBusFactory.getCommandBus(this.eventRepository).execute({
      type: ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE,
      data: {
        _id: id,
        name: 'sample',
        order: 2
      }
    });
  }
}
