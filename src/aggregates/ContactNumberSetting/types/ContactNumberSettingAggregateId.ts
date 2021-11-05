import {BaseAggregateIdInterface} from 'BaseAggregateIdInterface';
import {AggregateIdType} from '../../../models/EventStore';

export const ContactNumberSettingAggregateId: BaseAggregateIdInterface & AggregateIdType = {
  name: 'contact_number_setting'
};
