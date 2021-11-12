import {toLower, trim, isEmpty} from 'lodash';
import {ContactNumberSettingAggregateRecordInterface, ContactNumberSettingAggregateId} from './types';
import {AddContactNumberTypeCommandDataInterface} from './types/CommandDataTypes';
import {ValidationError} from 'a24-node-error-utils';

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
      const name = trim(toLower(commandData.name));

      for (const type of this.aggregate.types) {
        if (trim(toLower(type.name)) === name) {
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
