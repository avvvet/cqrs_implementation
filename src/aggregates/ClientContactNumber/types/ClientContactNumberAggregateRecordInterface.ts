import {ClientContactNumberInterface} from './ClientContactNumberInterface';
import {BaseAggregateRecordInterface} from 'BaseAggregateRecordInterface';

export interface ClientContactNumberAggregateRecordInterface extends BaseAggregateRecordInterface {
  contact_numbers?: ClientContactNumberInterface[];
}
