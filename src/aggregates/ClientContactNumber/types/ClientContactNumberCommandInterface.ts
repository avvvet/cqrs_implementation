import {ClientContactNumberCommandEnum} from './ClientContactNumberCommandEnum';
import {ClientContactNumberCommandDataType} from './ClientContactNumberCommandDataType';

export interface ClientContactNumberCommandInterface {
  type: ClientContactNumberCommandEnum;
  data: ClientContactNumberCommandDataType;
}
