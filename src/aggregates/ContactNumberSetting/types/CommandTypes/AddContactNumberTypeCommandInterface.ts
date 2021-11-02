import {ContactNumberSettingCommandEnum} from '../ContactNumberSettingCommandEnum';
import {AddContactNumberTypeCommandDataInterface} from '../CommandDataTypes';

export interface AddContactNumberTypeCommandInterface {
  type: ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE;
  data: AddContactNumberTypeCommandDataInterface;
}
