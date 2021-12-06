import {cloneDeep} from 'lodash';
import {ClientContactNumberWriteProjectionHandler} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberWriteProjectionHandler';
import {ClientContactNumberAggregateRecordInterface} from '../../../src/aggregates/ClientContactNumber/types';
import {EventsEnum} from '../../../src/Events';
import {EventStore} from '../../../src/models/EventStore';
import {ClientContactNumberAddedEventStoreDataInterface} from '../../../src/types/EventStoreDataTypes';

describe('ClientContactNumberWriteProjectionHandler', () => {
  describe('execute()', () => {
    describe('CLIENT_CONTACT_NUMBER_TYPE_ADDED', () => {
      it('Test when aggregate is empty', () => {
        const eventData: ClientContactNumberAddedEventStoreDataInterface = {
          _id: 'id',
          type_id: 'name',
          contact_number: '0911'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ClientContactNumberAggregateRecordInterface = {last_sequence_id: 0}; //here contact_numbers[] aggregate omitted
        const handler = new ClientContactNumberWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CLIENT_CONTACT_NUMBER_ADDED, aggregate, event);

        response.contact_numbers.length.should.equal(1);
        response.contact_numbers[0].should.deep.equal(eventData);
      });

      it('Test when there is already a record in aggregate', () => {
        const eventData: ClientContactNumberAddedEventStoreDataInterface = {
          _id: 'id',
          type_id: 'name',
          contact_number: '0911'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ClientContactNumberAggregateRecordInterface = {
          //here contact_numbers[] aggregate included
          last_sequence_id: 0,
          contact_numbers: [
            {
              _id: 'sample id',
              type_id: 'name',
              contact_number: '0911'
            }
          ]
        };
        const handler = new ClientContactNumberWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CLIENT_CONTACT_NUMBER_ADDED, aggregate, event);

        response.contact_numbers.length.should.equal(2);
        response.contact_numbers[1].should.deep.equal(eventData);
      });
    });
  });
});
