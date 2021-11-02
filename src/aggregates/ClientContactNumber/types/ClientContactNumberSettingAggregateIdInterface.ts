import {BaseAggregateIdInterface} from 'BaseAggregateIdInterface';
import {AggregateIdType} from '../../../models/EventStore';

export interface ClientContactNumberSettingAggregateIdInterface extends BaseAggregateIdInterface, AggregateIdType {
  client_id: string;
}
