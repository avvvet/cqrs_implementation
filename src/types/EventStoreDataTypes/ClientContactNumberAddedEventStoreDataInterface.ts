import {BaseEventStoreDataInterface} from 'EventStoreDataTypes/BaseEventStoreDataInterface';

export interface ClientContactNumberAddedEventStoreDataInterface extends BaseEventStoreDataInterface {
  _id: string;
  client_id: string;
  type_id: string;
  contact_number: string;
}
