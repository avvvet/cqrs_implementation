import {BaseEventStoreDataInterface} from 'EventStoreDataTypes/BaseEventStoreDataInterface';

export interface ClientContactNumberAddedEventStoreDataInterface extends BaseEventStoreDataInterface {
  _id: string;
  type_id: string;
  contact_number: string;
}
