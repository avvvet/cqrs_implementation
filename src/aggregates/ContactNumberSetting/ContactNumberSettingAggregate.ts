import {toLower, trim, isEmpty, find} from 'lodash';
import {ContactNumberSettingAggregateRecordInterface, ContactNumberSettingAggregateId} from './types';
import {AddContactNumberTypeCommandDataInterface} from './types/CommandDataTypes';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';
import {UpdateContactNumberTypeCommandDataInterface} from './types/CommandDataTypes/UpdateContactNumberTypeCommandDataInterface';

export class ContactNumberSettingAggregate {
  constructor(
    private id: typeof ContactNumberSettingAggregateId,
    private aggregate: ContactNumberSettingAggregateRecordInterface
  ) {}

  /**
   * Validate add contact number type
   * make sure we don't have any duplicate name
   * we trim and lowercase the `name` to make sure it's not duplicated
   */
  async validateAddContactNumberType(commandData: AddContactNumberTypeCommandDataInterface): Promise<void> {
    if (!isEmpty(this.aggregate.types)) {
      const name = ContactNumberSettingAggregate.normalizeName(commandData.name);

      for (const type of this.aggregate.types) {
        if (ContactNumberSettingAggregate.normalizeName(type.name) === name) {
          throw new ValidationError('Not allowed contact number type name', [
            {
              code: 'DUPLICATE_NAME',
              message: `name '${commandData.name}' already exists. we do not allow duplicates.`,
              path: ['name']
            }
          ]);
        }
      }
    }
  }

  /**
   * Validate update contact number type
   * make sure we don't have already the same contact number type name
   */
  async validateUpdateContactNumberType(commandData: UpdateContactNumberTypeCommandDataInterface): Promise<void> {
    if (!find(this.aggregate.types, {_id: commandData._id})) {
      throw new ResourceNotFoundError(`Contact number type with id ${commandData._id} not found`);
    }
    if (commandData.name) {
      const name = ContactNumberSettingAggregate.normalizeName(commandData.name);

      for (const record of this.aggregate.types) {
        if (record._id !== commandData._id && ContactNumberSettingAggregate.normalizeName(record.name) === name) {
          throw new ValidationError('Not allowed contact number type name', [
            {
              code: 'DUPLICATE_NAME',
              message: `name '${commandData.name}' already exists. we do not allow duplicates.`,
              path: ['name']
            }
          ]);
        }
      }
    }
  }

  /**
   * normalize contact number type name for checking duplicate
   */
  private static normalizeName(name: string): string {
    return trim(toLower(name));
  }

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
