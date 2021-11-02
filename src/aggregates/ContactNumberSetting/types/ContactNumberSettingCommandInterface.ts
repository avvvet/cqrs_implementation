import {ContactNumberSettingCommandEnum} from './ContactNumberSettingCommandEnum';
import {ContactNumberSettingCommandDataType} from './ContactNumberSettingCommandDataType';

export interface ContactNumberSettingCommandInterface {
  type: ContactNumberSettingCommandEnum;
  data: ContactNumberSettingCommandDataType;
}
