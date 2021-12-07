import {ClientContactNumberStatusEnum} from './ClientContactNumberStatusEnum';

export interface ClientContactNumberInterface {
  _id: string;
  type_id: string;
  contact_number: string;
  status?: ClientContactNumberStatusEnum;
}
