import {assert} from 'chai';
import {ClientContactNumberAggregate} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {
  ClientContactNumberAggregateIdInterface,
  ClientContactNumberStatusEnum
} from '../../../src/aggregates/ClientContactNumber/types';

describe('ClientContactNumberAggregate', function () {
  describe('clientContactNumberExists()', () => {
    it('Test Client contact number exists', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const aggregate = new ClientContactNumberAggregate(aggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            type_id: 'some-name',
            contact_number: '091'
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(aggregate.clientContactNumberExists('091', 'some-name'), 'Expected client contact number exists');
    });

    it('Test Client contact number not exists', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const aggregate = new ClientContactNumberAggregate(aggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            type_id: 'some-name',
            contact_number: '09111111'
          }
        ],
        last_sequence_id: 0
      });

      assert.isNotTrue(aggregate.clientContactNumberExists('09111111', 'diffrent-type'), 'Expected client contact number not exists');
    });
  });

  describe('isClientContactNumberIdExists()', () => {
    it('Test Client contact number id exists', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const aggregate = new ClientContactNumberAggregate(aggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            type_id: 'some-name',
            contact_number: '091'
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(
        aggregate.isClientContactNumberIdExists('61948046abd55b1a8ec55671'),
        'Expected client contact number id exists'
      );
    });

    it('Test Client contact number id not found', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const aggregate = new ClientContactNumberAggregate(aggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            type_id: 'some-name',
            contact_number: '09111111'
          }
        ],
        last_sequence_id: 0
      });

      assert.isNotTrue(
        aggregate.isClientContactNumberIdExists('77748046abd55b1a8ec55777'),
        'Expected client contact number id not found'
      );
    });
  });

  describe('isClientContactNumberRemoved()', () => {
    it('Test Client contact number not removed', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const aggregate = new ClientContactNumberAggregate(aggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            type_id: 'some-name',
            contact_number: '091'
          }
        ],
        last_sequence_id: 0
      });

      assert.isNotTrue(
        aggregate.isClientContactNumberRemoved('61948046abd55b1a8ec55671'),
        'Expected client contact number not removed'
      );
    });

    it('Test Client contact number removed', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const aggregate = new ClientContactNumberAggregate(aggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            type_id: 'some-name',
            contact_number: '09111111',
            status: ClientContactNumberStatusEnum.CLIENT_CONTACT_NUMBER_STATUS_REMOVED
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(
        aggregate.isClientContactNumberRemoved('61948046abd55b1a8ec55671'),
        'Expected client contact number removed'
      );
    });
  });
});
