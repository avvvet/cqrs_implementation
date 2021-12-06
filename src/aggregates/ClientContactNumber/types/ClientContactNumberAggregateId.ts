import {BaseAggregateIdInterface} from 'BaseAggregateIdInterface';
import {AggregateIdType} from '../../../models/EventStore';

export const ClientContactNumberAggregateId: BaseAggregateIdInterface & AggregateIdType = {
  name: 'client_contact_number'
};
