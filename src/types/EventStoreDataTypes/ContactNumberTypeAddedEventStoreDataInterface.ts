import {BaseEventStoreDataInterface} from 'EventStoreDataTypes/BaseEventStoreDataInterface';

export interface ContactNumberTypeAddedEventStoreDataInterface extends BaseEventStoreDataInterface {
  _id: string;
  name: string;
  order: number;
}
