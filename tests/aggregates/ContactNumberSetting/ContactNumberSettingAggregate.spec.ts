import {ContactNumberSettingAggregate} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {ContactNumberSettingAggregateId} from '../../../src/aggregates/ContactNumberSetting/types';
import {AddContactNumberTypeCommandDataInterface} from '../../../src/aggregates/ContactNumberSetting/types/CommandDataTypes';
import {ValidationError} from 'a24-node-error-utils';

describe('ContactNumberSettingAggregate', function () {
  describe('validateAddContactNumberType()', () => {
    it('Test duplicate name', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'id',
            name: 'some-name',
            order: 1
          }
        ],
        last_sequence_id: 0
      });
      const command: AddContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name'
      };
      const error = await aggregate.validateAddContactNumberType(command).should.be.rejectedWith(ValidationError);

      error.should.deep.equal(
        new ValidationError('Not allowed contact number type name', [
          {
            code: 'DUPLICATE_NAME',
            message: `name '${command.name}' already exists. we do not allow duplicates.`,
            path: ['name']
          }
        ])
      );
    });

    it('Test success when types not set', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        last_sequence_id: 0
      });
      const command: AddContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name'
      };

      await aggregate.validateAddContactNumberType(command);
    });

    it('Test success when there are another types', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'id',
            name: 'some-name oops',
            order: 1
          }
        ],
        last_sequence_id: 0
      });
      const command: AddContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name'
      };

      await aggregate.validateAddContactNumberType(command);
    });
  });
});
