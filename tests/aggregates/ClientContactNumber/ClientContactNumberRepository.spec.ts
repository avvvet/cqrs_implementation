import sinon from 'ts-sinon';
import {ClientContactNumberRepository} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberWriteProjectionHandler} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberWriteProjectionHandler';
import {ClientContactNumberAggregateId} from '../../../src/aggregates/ClientContactNumber/types';
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
      const writeProjectionHandler = new ClientContactNumberWriteProjectionHandler();
      const clientContactNumberRepository = new ClientContactNumberRepository(eventRepository, writeProjectionHandler);

      const leftFoldEvents = sinon.stub(eventRepository, 'leftFoldEvents').resolves();
      const sequenceId = 100;
      const aggregate = await clientContactNumberRepository.getAggregate('client-id', sequenceId);
      const aggregateClientContactNumber = {client_id: 'client-id', name: 'client_contact_number'};

      leftFoldEvents.should.have.been.calledWith(writeProjectionHandler, aggregateClientContactNumber, sequenceId);

      aggregate.getId().should.deep.equal(aggregateClientContactNumber);
    });
  });

  describe('save()', () => {
    it('Test call eventRepository', async () => {
      const eventRepository = new EventRepository(EventStore, 'some-id');
      const writeProjectionHandler = new ClientContactNumberWriteProjectionHandler();
      const repository = new ClientContactNumberRepository(eventRepository, writeProjectionHandler);
      const save = sinon.stub(eventRepository, 'save').resolves([]);
      const events = [
        {
          type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
          aggregate_id: ClientContactNumberAggregateId,
          data: {
            _id: 'some id',
            client_id: 'client-id',
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
