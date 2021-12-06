import {find} from 'lodash';
import {ClientContactNumberAggregateId} from '../ClientContactNumber/types';
import {ClientContactNumberAggregateRecordInterface} from './types';

export class ClientContactNumberAggregate {
  constructor(
    private id: typeof ClientContactNumberAggregateId,
    private aggregate: ClientContactNumberAggregateRecordInterface
  ) {}

  isClientContactNumberExists(contactNumber: string): boolean {
    let isExist = false;
    const clientContactNumber = find(this.aggregate.contact_numbers, {contact_number: contactNumber});

    if (clientContactNumber) {
      isExist = true;
    }
    return isExist;
  }

  getId(): typeof ClientContactNumberAggregateId {
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
