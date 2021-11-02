import {BaseAggregateIdInterface} from 'BaseAggregateIdInterface';
import {AggregateIdType} from '../../../models/EventStore';

export const ContactNumberSettingAggregateId: BaseAggregateIdInterface & AggregateIdType = {
  type: 'contact_number_setting'
};
