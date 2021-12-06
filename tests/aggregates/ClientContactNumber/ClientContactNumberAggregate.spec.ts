import {assert} from 'chai';
import {ClientContactNumberAggregate} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberAggregateId} from '../../../src/aggregates/ClientContactNumber/types';

describe('ClientContactNumberAggregate', function () {
  describe('isClientContactNumberExists()', () => {
    it('Test Client contact number exists', () => {
      const aggregate = new ClientContactNumberAggregate(ClientContactNumberAggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            client_id: 'client-id',
            type_id: 'some-name',
            contact_number: '091'
          }
        ],
        last_sequence_id: 0
      });

      assert.isTrue(aggregate.isClientContactNumberExists('091'), 'Expected client contact number exists');
    });

    it('Test Client contact number not exists', () => {
      const aggregate = new ClientContactNumberAggregate(ClientContactNumberAggregateId, {
        contact_numbers: [
          {
            _id: '61948046abd55b1a8ec55671',
            client_id: 'client-id',
            type_id: 'some-name',
            contact_number: '09111111'
          }
        ],
        last_sequence_id: 0
      });

      assert.isNotTrue(aggregate.isClientContactNumberExists('09222222'), 'Expected client contact number not exists');
    });
  });
});
