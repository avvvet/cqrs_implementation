import {EnableContactNumberTypeCommandDataInterface} from '../CommandDataTypes/EnableContactNumberTypeCommandDataInterface';
import {ContactNumberSettingCommandEnum} from '../ContactNumberSettingCommandEnum';

export interface EnableContactNumberTypeCommandInterface {
  type: ContactNumberSettingCommandEnum.ENABLE_CONTACT_NUMBER_TYPE;
  data: EnableContactNumberTypeCommandDataInterface;
}
