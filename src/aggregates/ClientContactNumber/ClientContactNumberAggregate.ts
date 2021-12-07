import {find} from 'lodash';
import {ClientContactNumberAggregateIdInterface} from '../ClientContactNumber/types';
import {ClientContactNumberAggregateRecordInterface, ClientContactNumberStatusEnum} from './types';

export class ClientContactNumberAggregate {
  constructor(
    private id: ClientContactNumberAggregateIdInterface,
    private aggregate: ClientContactNumberAggregateRecordInterface
  ) {}

  clientContactNumberExists(contactNumber: string, contactNumberType: string): boolean {
    const clientContactNumber = find(this.aggregate.contact_numbers, {contact_number: contactNumber, type_id: contactNumberType});

    if (clientContactNumber) {
      return true;
    }
    return false;
  }

  isClientContactNumberIdExists(contactNumberId: string): boolean {
    const clientContactNumberId = find(this.aggregate.contact_numbers, {_id: contactNumberId});

    if (clientContactNumberId) {
      return true;
    }
    return false;
  }

  isClientContactNumberRemoved(contactNumberId: string): boolean {
    const clientContactNumber = find(this.aggregate.contact_numbers, {_id: contactNumberId});

    if (clientContactNumber.status == ClientContactNumberStatusEnum.CLIENT_CONTACT_NUMBER_STATUS_REMOVED) {
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
