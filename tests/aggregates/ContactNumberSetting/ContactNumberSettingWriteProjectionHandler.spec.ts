import {cloneDeep} from 'lodash';
import {ContactNumberSettingWriteProjectionHandler} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingWriteProjectionHandler';
import {
  ContactNumberSettingAggregateRecordInterface,
  ContactNumberTypeStatusEnum
} from '../../../src/aggregates/ContactNumberSetting/types';
import {EventsEnum} from '../../../src/Events';
import {EventStore} from '../../../src/models/EventStore';
import {
  ContactNumberTypeAddedEventStoreDataInterface,
  ContactNumberTypeUpdatedEventStoreDataInterface,
  ContactNumberTypeEnabledEventStoreDataInterface,
  ContactNumberTypeDisabledEventStoreDataInterface
} from '../../../src/types/EventStoreDataTypes';

describe('ContactNumberSettingWriteProjectionHandler', () => {
  describe('execute()', () => {
    describe('CONTACT_NUMBER_TYPE_ADDED', () => {
      it('Test when aggregate is empty', () => {
        const eventData: ContactNumberTypeAddedEventStoreDataInterface = {
          _id: 'id',
          name: 'name',
          order: 1
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {last_sequence_id: 0};
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_ADDED, aggregate, event);

        response.types.length.should.equal(1);
        response.types[0].should.deep.equal(eventData);
      });

      it('Test when there is already a record in aggregate', () => {
        const eventData: ContactNumberTypeAddedEventStoreDataInterface = {
          _id: 'id',
          name: 'name',
          order: 1
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'sample id',
              name: 'oops',
              order: 2
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_ADDED, aggregate, event);

        response.types.length.should.equal(2);
        response.types[1].should.deep.equal(eventData);
      });
    });
    describe('CONTACT_NUMBER_TYPE_ENABLED', () => {
      it('Test when record is found', () => {
        const eventData: ContactNumberTypeEnabledEventStoreDataInterface = {
          _id: 'id'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id',
              name: 'oops',
              order: 2
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_ENABLED, aggregate, event);

        response.types.length.should.equal(2);
        response.types[1].status.should.equal(ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED);
      });

      it('Test when record not found', () => {
        const eventData: ContactNumberTypeEnabledEventStoreDataInterface = {
          _id: 'id'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id3',
              name: 'oops',
              order: 2
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_ENABLED, aggregate, event);

        response.types.length.should.equal(2);
        (response.types[0].status === undefined).should.be.true;
        (response.types[1].status === undefined).should.be.true;
      });
    });

    describe('CONTACT_NUMBER_TYPE_DISABLED', () => {
      it('Test when record is found', () => {
        const eventData: ContactNumberTypeDisabledEventStoreDataInterface = {
          _id: 'id'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id',
              name: 'oops',
              order: 2
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_DISABLED, aggregate, event);

        response.types.length.should.equal(2);
        response.types[1].status.should.equal(ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED);
      });

      it('Test when record not found', () => {
        const eventData: ContactNumberTypeDisabledEventStoreDataInterface = {
          _id: 'id'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id3',
              name: 'oops',
              order: 2
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_DISABLED, aggregate, event);

        response.types.length.should.equal(2);
        (response.types[0].status === undefined).should.be.true;
        (response.types[1].status === undefined).should.be.true;
      });
    });

    describe('CONTACT_NUMBER_TYPE_UPDATED', () => {
      it('Test when record is found and both order and name set', () => {
        const eventData: ContactNumberTypeUpdatedEventStoreDataInterface = {
          _id: 'id',
          order: 2,
          name: 'new name'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id',
              name: 'oops',
              order: 10
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_UPDATED, aggregate, event);

        response.types.length.should.equal(2);
        response.types[1].name.should.equal('new name');
        response.types[1].order.should.equal(2);
      });

      it('Test when record is found and only order is set', () => {
        const eventData: ContactNumberTypeUpdatedEventStoreDataInterface = {
          _id: 'id',
          order: 2
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id',
              name: 'oops',
              order: 10
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_UPDATED, aggregate, event);

        response.types.length.should.equal(2);
        response.types[1].name.should.equal('oops');
        response.types[1].order.should.equal(2);
      });

      it('Test when record is found and only name is set', () => {
        const eventData: ContactNumberTypeUpdatedEventStoreDataInterface = {
          _id: 'id',
          name: 'new'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id',
              name: 'oops',
              order: 10
            }
          ]
        };
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_UPDATED, aggregate, event);

        response.types.length.should.equal(2);
        response.types[1].name.should.equal('new');
        response.types[1].order.should.equal(10);
      });

      it('Test when record not found', () => {
        const eventData: ContactNumberTypeUpdatedEventStoreDataInterface = {
          _id: 'id',
          order: 2,
          name: 'new name'
        };
        const event = new EventStore({
          type: 'sample',
          aggregate_id: {},
          data: eventData,
          sequence_id: 1,
          meta_data: {},
          correlation_id: 1
        });
        const aggregate: ContactNumberSettingAggregateRecordInterface = {
          last_sequence_id: 0,
          types: [
            {
              _id: 'id2',
              name: 'oops2',
              order: 2
            },
            {
              _id: 'id33',
              name: 'oops',
              order: 10
            }
          ]
        };
        const original = cloneDeep(aggregate.types);
        const handler = new ContactNumberSettingWriteProjectionHandler();

        const response = handler.execute(EventsEnum.CONTACT_NUMBER_TYPE_UPDATED, aggregate, event);

        response.types.should.deep.equal(original);
      });
    });
  });
});
