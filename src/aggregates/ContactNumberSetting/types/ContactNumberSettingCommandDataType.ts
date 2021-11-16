import {AddContactNumberTypeCommandDataInterface} from './CommandDataTypes';
import {UpdateContactNumberTypeCommandDataInterface} from './CommandDataTypes/UpdateContactNumberTypeCommandDataInterface';

export type ContactNumberSettingCommandDataType =
  | AddContactNumberTypeCommandDataInterface
  | UpdateContactNumberTypeCommandDataInterface;
