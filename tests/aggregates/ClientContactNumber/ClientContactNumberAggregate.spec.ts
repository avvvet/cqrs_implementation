import {assert} from 'chai';
import {ClientContactNumberAggregate} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberAggregateIdInterface} from '../../../src/aggregates/ClientContactNumber/types';

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

      assert.isNotTrue(
        aggregate.clientContactNumberExists('09111111', 'diffrent-type'),
        'Expected client contact number not exists'
      );
    });
  });

  describe('clientContactNumberIdExists()', () => {
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
        aggregate.clientContactNumberIdExists('61948046abd55b1a8ec55671'),
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
        aggregate.clientContactNumberIdExists('77748046abd55b1a8ec55777'),
        'Expected client contact number id not found'
      );
    });
  });
});
