import {BaseAggregateIdInterface} from 'BaseAggregateIdInterface';
import {AggregateIdType} from '../../../models/EventStore';

export interface ClientContactNumberAggregateIdInterface extends BaseAggregateIdInterface, AggregateIdType {
  client_id: string;
  name: 'client_contact_number';
}
