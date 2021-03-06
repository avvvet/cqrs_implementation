import {assert} from 'chai';
import {ContactNumberSettingAggregate} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {
  ContactNumberSettingAggregateId,
  ContactNumberTypeInterface,
  ContactNumberTypeStatusEnum
} from '../../../src/aggregates/ContactNumberSetting/types';
import {
  AddContactNumberTypeCommandDataInterface,
  UpdateContactNumberTypeCommandDataInterface,
  EnableContactNumberTypeCommandDataInterface
} from '../../../src/aggregates/ContactNumberSetting/types/CommandDataTypes';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';

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

  describe('validateUpdateContactNumberType()', () => {
    it('Test success scenario', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'another id',
            name: 'some-name22',
            order: 1
          },
          {
            _id: 'id',
            name: 'some-name',
            order: 1
          }
        ],
        last_sequence_id: 0
      });
      const command: UpdateContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name new'
      };

      await aggregate.validateUpdateContactNumberType(command);
    });

    it('Test duplicate name', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'another id',
            name: 'some-name22',
            order: 1
          },
          {
            _id: 'id',
            name: 'some-name',
            order: 1
          }
        ],
        last_sequence_id: 0
      });
      const command: UpdateContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name'
      };
      const error = await aggregate.validateUpdateContactNumberType(command).should.be.rejectedWith(ValidationError);

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

    it('Test resource not found', async () => {
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
      const command: UpdateContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name'
      };

      await aggregate.validateUpdateContactNumberType(command).should.be.rejectedWith(ResourceNotFoundError);
    });

    it('Test resource not found when types not set', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        last_sequence_id: 0
      });
      const command: UpdateContactNumberTypeCommandDataInterface = {
        _id: 'another id',
        name: 'some-name'
      };

      await aggregate.validateUpdateContactNumberType(command).should.be.rejectedWith(ResourceNotFoundError);
    });
  });

  describe('canEnableContactNumberType()', () => {
    it('Test contact number type is disabled', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: '61948046abd55b1a8ec55671',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(aggregate.canEnableContactNumberType('61948046abd55b1a8ec55671'), 'Expected to enable');
    });

    it('Test contact number type is already enabled', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: '61948046abd55b1a8ec55671',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isFalse(aggregate.canEnableContactNumberType('61948046abd55b1a8ec55671'), 'Expected not to enable');
    });

    it('Test resource not found', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'id',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.throws(() => aggregate.canEnableContactNumberType('some-id'), ResourceNotFoundError);
    });
  });

  describe('canDisableContactNumberType()', () => {
    it('Test contact number type is enabled and can be disabled', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: '61948046abd55b1a8ec55671',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(aggregate.canDisableContactNumberType('61948046abd55b1a8ec55671'), 'Expected to disable');
    });

    it('Test contact number type is already disabled so that can not be disabled again', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: '61948046abd55b1a8ec55671',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isFalse(aggregate.canDisableContactNumberType('61948046abd55b1a8ec55671'), 'Expected not to disable');
    });

    it('Test resource not found', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'some-id',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.throws(() => aggregate.canDisableContactNumberType('other-id'), ResourceNotFoundError);
    });
  });

  describe('contactNumberTypeEnabled()', () => {
    it('Test contact number type is enabled', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: '61948046abd55b1a8ec55671',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(aggregate.contactNumberTypeEnabled('61948046abd55b1a8ec55671'), 'Expected to be enabled');
    });

    it('Test contact number type is disabled', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: '61948046abd55b1a8ec55671',
            name: 'some-name',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isNotTrue(aggregate.contactNumberTypeEnabled('61948046abd55b1a8ec55671'), 'Expected to be disabled');
    });
  });

  describe('contactNumberTypeExists()', () => {
    it('Test contact number type to exists', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'some-id',
            name: 'mobile',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(aggregate.contactNumberTypeExists('some-id'), 'Expected to exists');
    });

    it('Test contact number type not to exists', () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'some-id',
            name: 'mobile',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      assert.isNotTrue(aggregate.contactNumberTypeExists('other-id'), 'Expected to not exists');
    });
  });

  describe('getContactNumberType()', () => {
    it('Test getContactNumberType success scenario to return a contact number type', async () => {
      const contactNumberType = {
        _id: 'some-id',
        name: 'mobile',
        order: 1,
        status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
      } as ContactNumberTypeInterface;

      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'some-id',
            name: 'mobile',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });
      const result = await aggregate.getContactNumberType('some-id');

      assert.deepEqual(contactNumberType, result, 'Expected to exists');
    });

    it('Test getContactNumberType failure when return is undefined', async () => {
      const aggregate = new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, {
        types: [
          {
            _id: 'some-id',
            name: 'mobile',
            order: 1,
            status: ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED
          }
        ],
        last_sequence_id: 0
      });

      const contactNumberType = await aggregate.getContactNumberType('other-id');

      assert.isUndefined(contactNumberType, 'Expected to return undefined');
    });
  });
});
