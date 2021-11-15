import {BaseEventStoreDataInterface} from 'EventStoreDataTypes/BaseEventStoreDataInterface';

export interface ContactNumberTypeUpdatedEventStoreDataInterface extends BaseEventStoreDataInterface {
  _id: string;
  name?: string;
  order?: number;
}
