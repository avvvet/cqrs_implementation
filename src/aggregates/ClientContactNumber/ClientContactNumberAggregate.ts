import {ClientContactNumberAggregateRecordInterface, ClientContactNumberAggregateIdInterface} from './types';

export class ClientContactNumberAggregate {
  constructor(
    private id: ClientContactNumberAggregateIdInterface,
    private aggregate: ClientContactNumberAggregateRecordInterface
  ) {}
  getId(): ClientContactNumberAggregateIdInterface {
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
