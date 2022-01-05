import {find} from 'lodash';
import {ClientContactNumberAggregateIdInterface, ClientContactNumberAggregateRecordInterface} from './types';
import {ResourceNotFoundError, ValidationError} from 'a24-node-error-utils';
import {ContactNumberSettingRepository} from '../ContactNumberSetting';

export class ClientContactNumberAggregate {
  constructor(
    private id: ClientContactNumberAggregateIdInterface,
    private aggregate: ClientContactNumberAggregateRecordInterface,
    private contactNumberSettingRepository: ContactNumberSettingRepository
  ) {}

  /**
   * Check if a client contact number exists
   */
  clientContactNumberExists(contactNumber: string, contactNumberType: string): boolean {
    return !!find(this.aggregate.contact_numbers, {
      contact_number: contactNumber,
      type_id: contactNumberType
    });
  }

  /**
   * Check if a client contact number with the given id exists
   */
  clientContactNumberIdExists(contactNumberId: string): boolean {
    return !!find(this.aggregate.contact_numbers, {_id: contactNumberId});
  }

  /**
   * Enforces all invariant checks that needs to be valid before adding a new contact number
   */
  async validateAddClientContactNumberInvariants(contactNumberTypeId: string, contactNumber: string): Promise<void> {
    const aggregateContactNumberSetting = await this.contactNumberSettingRepository.getAggregate();

    if (!aggregateContactNumberSetting.contactNumberTypeExists(contactNumberTypeId)) {
      throw new ValidationError('Not allowed. Contact number type does not exist', [
        {
          code: 'CONTACT_NUMBER_TYPE_NOT_FOUND',
          message: `contact number type '${contactNumberTypeId}' does not exist.`,
          path: ['type_id']
        }
      ]);
    }

    if (!aggregateContactNumberSetting.contactNumberTypeEnabled(contactNumberTypeId)) {
      throw new ValidationError('Not allowed. Contact number type is disabled', [
        {
          code: 'CONTACT_NUMBER_TYPE_DISABLED',
          message: `contact number type '${contactNumberTypeId}' is disabled.`,
          path: ['type_id']
        }
      ]);
    }

    if (this.clientContactNumberExists(contactNumber, contactNumberTypeId)) {
      throw new ValidationError('Not allowed. Client Contact number already exists', [
        {
          code: 'CONTACT_NUMBER_ALREADY_EXISTS',
          message: `Client contact number '${contactNumber}' already exists.`,
          path: ['contact_number']
        }
      ]);
    }
  }

  /**
   * Enforces all invariant checks that needs to be valid before removing a contact number
   */
  validateRemoveClientContactNumberInvariants(contactNumberId: string): void {
    if (!this.clientContactNumberIdExists(contactNumberId)) {
      throw new ResourceNotFoundError('Not allowed. Client Contact number not found');
    }
  }

  /**
   * Returns aggregate id
   */
  getId(): ClientContactNumberAggregateIdInterface {
    return this.id;
  }

  /**
   * Returns aggregate last event id
   */
  getLastEventId(): number {
    return this.aggregate.last_sequence_id;
  }

  // Base class method for all aggregates
  toJSON(): ClientContactNumberAggregateRecordInterface {
    return this.aggregate;
  }
}
