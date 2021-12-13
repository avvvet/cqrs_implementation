import {find} from 'lodash';
import {ClientContactNumberAggregateIdInterface} from '../ClientContactNumber/types';
import {ClientContactNumberAggregateRecordInterface} from './types';

export class ClientContactNumberAggregate {
  constructor(
    private id: ClientContactNumberAggregateIdInterface,
    private aggregate: ClientContactNumberAggregateRecordInterface
  ) {}

  clientContactNumberExists(contactNumber: string, contactNumberType: string): boolean {
    const clientContactNumber = find(this.aggregate.contact_numbers, {
      contact_number: contactNumber,
      type_id: contactNumberType
    });

    if (clientContactNumber) {
      return true;
    }
    return false;
  }

  clientContactNumberIdExists(contactNumberId: string): boolean {
    const clientContactNumberId = find(this.aggregate.contact_numbers, {_id: contactNumberId});

    if (clientContactNumberId) {
      return true;
    }
    return false;
  }

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
