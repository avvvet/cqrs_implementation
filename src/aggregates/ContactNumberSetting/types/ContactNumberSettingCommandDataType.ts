import {AddContactNumberTypeCommandDataInterface} from './CommandDataTypes';
import {UpdateContactNumberTypeCommandDataInterface} from './CommandDataTypes/UpdateContactNumberTypeCommandDataInterface';
import {EnableContactNumberTypeCommandDataInterface} from './CommandDataTypes/EnableContactNumberTypeCommandDataInterface';

export type ContactNumberSettingCommandDataType =
  | AddContactNumberTypeCommandDataInterface
  | UpdateContactNumberTypeCommandDataInterface
  | EnableContactNumberTypeCommandDataInterface;
