import {UpdateContactNumberTypeCommandDataInterface} from '../CommandDataTypes/UpdateContactNumberTypeCommandDataInterface';
import {ContactNumberSettingCommandEnum} from '../ContactNumberSettingCommandEnum';

export interface UpdateContactNumberTypeCommandInterface {
  type: ContactNumberSettingCommandEnum.UPDATE_CONTACT_NUMBER_TYPE;
  data: UpdateContactNumberTypeCommandDataInterface;
}
