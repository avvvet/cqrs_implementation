import {ClientContactNumberCommandEnum} from '../ClientContactNumberCommandEnum';
import {RemoveClientContactNumberCommandDataInterface} from '../CommandDataTypes';

export interface RemoveClientContactNumberCommandInterface {
  type: ClientContactNumberCommandEnum.REMOVE_CLIENT_CONTACT_NUMBER;
  data: RemoveClientContactNumberCommandDataInterface;
}
