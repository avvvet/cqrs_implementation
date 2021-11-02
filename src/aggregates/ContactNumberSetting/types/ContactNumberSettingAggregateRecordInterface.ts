import {ContactNumberTypeInterface} from './ContactNumberTypeInterface';
import {BaseAggregateRecordInterface} from 'BaseAggregateRecordInterface';

export interface ContactNumberSettingAggregateRecordInterface extends BaseAggregateRecordInterface {
  contact_number_types?: ContactNumberTypeInterface[];
}
