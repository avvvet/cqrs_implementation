import sinon, {stubConstructor} from 'ts-sinon';
import {ClientContactNumberRepository} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberWriteProjectionHandler} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberWriteProjectionHandler';
import {ClientContactNumberAggregateIdInterface} from '../../../src/aggregates/ClientContactNumber/types';
import {EventRepository} from '../../../src/EventRepository';
import {EventsEnum} from '../../../src/Events';
import {EventStore} from '../../../src/models/EventStore';
import {ContactNumberSettingRepository} from '../../../src/aggregates/ContactNumberSetting';

describe('ContactNumberSettingRepository class', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAggregate()', () => {
    it('Test success', async () => {
      const eventRepository = new EventRepository(EventStore, 'some-id');
      const writeProjectionHandler = new ClientContactNumberWriteProjectionHandler();
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const clientContactNumberRepository = new ClientContactNumberRepository(
        eventRepository,
        writeProjectionHandler,
        contactNumberSettingRepository
      );

      const leftFoldEvents = sinon.stub(eventRepository, 'leftFoldEvents').resolves();
      const sequenceId = 100;
      const aggregate = await clientContactNumberRepository.getAggregate('client-id', sequenceId);
      const aggregateClientContactNumberId = {client_id: 'client-id', name: 'client_contact_number'};

      leftFoldEvents.should.have.been.calledWith(writeProjectionHandler, aggregateClientContactNumberId, sequenceId);

      aggregate.getId().should.deep.equal(aggregateClientContactNumberId);
    });
  });

  describe('save()', () => {
    it('Test call eventRepository with ClientContactNumberAdded event type', async () => {
      const eventRepository = new EventRepository(EventStore, 'some-id');
      const writeProjectionHandler = new ClientContactNumberWriteProjectionHandler();
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const repository = new ClientContactNumberRepository(
        eventRepository,
        writeProjectionHandler,
        contactNumberSettingRepository
      );
      const save = sinon.stub(eventRepository, 'save').resolves([]);
      const aggregateClientContactNumberId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const events = [
        {
          type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
          aggregate_id: aggregateClientContactNumberId,
          data: {
            _id: 'some id',
            type_id: 'type-id',
            contact_number: '0911'
          },
          sequence_id: 10
        }
      ];

      await repository.save(events);
      save.should.have.been.calledWith(events);
    });

    it('Test call eventRepository with clientContactNumberRemoved type', async () => {
      const eventRepository = new EventRepository(EventStore, 'some-id');
      const writeProjectionHandler = new ClientContactNumberWriteProjectionHandler();
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const repository = new ClientContactNumberRepository(
        eventRepository,
        writeProjectionHandler,
        contactNumberSettingRepository
      );
      const save = sinon.stub(eventRepository, 'save').resolves([]);
      const aggregateClientContactNumberId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const events = [
        {
          type: EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED,
          aggregate_id: aggregateClientContactNumberId,
          data: {
            _id: 'some id',
            type_id: 'type-id',
            contact_number: '0911'
          },
          sequence_id: 10
        }
      ];

      await repository.save(events);
      save.should.have.been.calledWith(events);
    });
  });
});
