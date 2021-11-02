import {
  ContactNumberSettingAggregateRecordInterface,
  ContactNumberSettingAggregateId
} from './types';

export class ContactNumberSettingAggregate {
  constructor(
    private id: typeof ContactNumberSettingAggregateId,
    private aggregate: ContactNumberSettingAggregateRecordInterface
  ) {}
  getId(): typeof ContactNumberSettingAggregateId {
    return this.id;
  }

  getLastEventId(): number {
    return this.aggregate.last_sequence_id;
  }

  // Base class method for all aggregates
  toJSON(): ContactNumberSettingAggregateRecordInterface {
    return this.aggregate;
  }
}
