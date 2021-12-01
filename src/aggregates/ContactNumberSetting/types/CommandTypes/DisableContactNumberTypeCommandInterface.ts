import {DisableContactNumberTypeCommandDataInterface} from '../CommandDataTypes/DisableContactNumberTypeCommandDataInterface';
import {ContactNumberSettingCommandEnum} from '../ContactNumberSettingCommandEnum';

export interface DisableContactNumberTypeCommandInterface {
  type: ContactNumberSettingCommandEnum.DISABLE_CONTACT_NUMBER_TYPE;
  data: DisableContactNumberTypeCommandDataInterface;
}
