import {ClientContactNumberCommandEnum} from '../ClientContactNumberCommandEnum';
import {AddClientContactNumberCommandDataInterface} from '../CommandDataTypes';

export interface AddClientContactNumberCommandInterface {
  type: ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER;
  data: AddClientContactNumberCommandDataInterface;
}
