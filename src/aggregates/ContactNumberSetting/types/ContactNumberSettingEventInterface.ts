import {ContactNumberSettingAggregateId} from './ContactNumberSettingAggregateId';
import {EventsEnum} from '../../../Events';
import {ContactNumberSettingCommandDataType} from './ContactNumberSettingCommandDataType';

export interface ContactNumberSettingEventInterface {
  type: EventsEnum;
  aggregate_id: typeof ContactNumberSettingAggregateId;
  data: ContactNumberSettingCommandDataType;
  sequence_id: number;
}
