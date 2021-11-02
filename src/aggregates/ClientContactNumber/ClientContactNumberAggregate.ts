import {
  ClientContactNumberAggregateRecordInterface,
  ClientContactNumberSettingAggregateIdInterface
} from './types';

export class ClientContactNumberAggregate {
  constructor(
    private id: ClientContactNumberSettingAggregateIdInterface,
    private aggregate: ClientContactNumberAggregateRecordInterface
  ) {}
  getId(): ClientContactNumberSettingAggregateIdInterface {
    return this.id;
  }

  getLastEventId(): number {
    return this.aggregate.last_sequence_id;
  }

  // Base class method for all aggregates
  toJSON(): ClientContactNumberAggregateRecordInterface {
    return this.aggregate;
  }
}
