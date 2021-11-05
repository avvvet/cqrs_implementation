import {ContactNumberTypeStatusEnum} from './ContactNumberTypeStatusEnum';

export interface ContactNumberTypeInterface {
  _id: string;
  name: string;
  order: number;
  status?: ContactNumberTypeStatusEnum;
}
