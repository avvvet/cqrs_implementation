import {toLower, trim, isEmpty, find} from 'lodash';
import {
  ContactNumberSettingAggregateRecordInterface,
  ContactNumberSettingAggregateId,
  ContactNumberTypeStatusEnum,
  ContactNumberTypeInterface
} from './types';
import {
  AddContactNumberTypeCommandDataInterface,
  UpdateContactNumberTypeCommandDataInterface
} from './types/CommandDataTypes';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';

export class ContactNumberSettingAggregate {
  constructor(
    private id: typeof ContactNumberSettingAggregateId,
    private aggregate: ContactNumberSettingAggregateRecordInterface
  ) {}

  /**
   * normalize contact number type name for checking duplicate
   */
  private static normalizeName(name: string): string {
    return trim(toLower(name));
  }

  /**
   * checks if contact number type exists
   */
  private validateTypeExistence(contactNumberTypeId: string): ContactNumberTypeInterface {
    const contactNumberType = find(this.aggregate.types, {_id: contactNumberTypeId});

    if (!contactNumberType) {
      throw new ResourceNotFoundError(`Contact number type with id ${contactNumberTypeId} not found`);
    }

    return contactNumberType;
  }

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
    this.validateTypeExistence(commandData._id);
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

  canEnableContactNumberType(contactNumberTypeId: string): boolean {
    const contactNumberType = this.validateTypeExistence(contactNumberTypeId);

    return contactNumberType.status !== ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED;
  }

  canDisableContactNumberType(contactNumberTypeId: string): boolean {
    const contactNumberType = this.validateTypeExistence(contactNumberTypeId);

    return contactNumberType.status !== ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED;
  }

  getId(): typeof ContactNumberSettingAggregateId {
    return this.id;
  }

  contactNumberTypeEnabled(contactNumberTypeId: string): boolean {
    const contactNumberType = find(this.aggregate.types, {_id: contactNumberTypeId});

    return contactNumberType.status == ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED;
  }

  contactNumberTypeExists(contactNumberTypeId: string): boolean {
    return !!find(this.aggregate.types, {_id: contactNumberTypeId});
  }

  async getContactNumberType(contactNumberTypeId: string): Promise<ContactNumberTypeInterface | undefined> {
    return find(this.aggregate.types, {_id: contactNumberTypeId});
  }

  getLastEventId(): number {
    return this.aggregate.last_sequence_id;
  }

  // Base class method for all aggregates
  toJSON(): ContactNumberSettingAggregateRecordInterface {
    return this.aggregate;
  }
}
