import sinon from 'ts-sinon';
import {ContactNumberSettingRepository} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingWriteProjectionHandler} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingWriteProjectionHandler';
import {
  ContactNumberSettingAggregateRecordInterface,
  ContactNumberSettingAggregateId
} from '../../../src/aggregates/ContactNumberSetting/types';
import {EventRepository} from '../../../src/EventRepository';
import {EventsEnum} from '../../../src/Events';
import {EventStore} from '../../../src/models/EventStore';

describe('ContactNumberSettingRepository class', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAggregate()', () => {
    it('Test success', async () => {
      const eventRepository = new EventRepository(EventStore, 'some-id');
      const writeProjectionHandler = new ContactNumberSettingWriteProjectionHandler();
      const repository = new ContactNumberSettingRepository(eventRepository, writeProjectionHandler);

      const projection: ContactNumberSettingAggregateRecordInterface = {
        types: [],
        last_sequence_id: 10
      };

      const leftFoldEvents = sinon.stub(eventRepository, 'leftFoldEvents').resolves(projection);

      const aggregate = await repository.getAggregate();

      leftFoldEvents.should.have.been.calledWith(writeProjectionHandler, ContactNumberSettingAggregateId, undefined);
      aggregate.getId().should.equal(ContactNumberSettingAggregateId);
    });
  });

  describe('save()', () => {
    it('Test call eventRepository', async () => {
      const eventRepository = new EventRepository(EventStore, 'some-id');
      const writeProjectionHandler = new ContactNumberSettingWriteProjectionHandler();
      const repository = new ContactNumberSettingRepository(eventRepository, writeProjectionHandler);
      const save = sinon.stub(eventRepository, 'save').resolves([]);
      const events = [
        {
          type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
          aggregate_id: ContactNumberSettingAggregateId,
          data: {
            _id: 'some id'
          },
          sequence_id: 10
        }
      ];

      await repository.save(events);
      save.should.have.been.calledWith(events);
    });
  });
});
