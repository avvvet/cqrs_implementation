import {
  AddClientContactNumberCommandDataInterface,
  RemoveClientContactNumberCommandDataInterface
} from './CommandDataTypes';

export type ClientContactNumberCommandDataType =
  | AddClientContactNumberCommandDataInterface
  | RemoveClientContactNumberCommandDataInterface;
