import sinon, {stubConstructor} from 'ts-sinon';
import {AddClientContactNumberCommandHandler} from '../../../../src/aggregates/ClientContactNumber/command-handlers';
import {ClientContactNumberAggregate} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberRepository} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberAggregateIdInterface} from '../../../../src/aggregates/ClientContactNumber/types';
import {AddClientContactNumberCommandDataInterface} from '../../../../src/aggregates/ClientContactNumber/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ClientContactNumberAddedEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes';

describe('AddClientContactNumberCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test success scenario', async () => {
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      repositoryClientContactNumber.save.resolves();
      aggregateClientContactNumber.validateAddClientContactNumberInvariants.resolves();
      aggregateClientContactNumber.getLastEventId.returns(2);
      const clientContactNumberAggregateId = {
        client_id: 'sample-client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;

      aggregateClientContactNumber.getId.returns(clientContactNumberAggregateId);
      const clientId = 'sample-client-id';
      const handler = new AddClientContactNumberCommandHandler(repositoryClientContactNumber);
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };

      await handler.execute(clientId, command);
      aggregateClientContactNumber.validateAddClientContactNumberInvariants.should.have.been.calledOnceWith(
        command.type_id,
        command.contact_number
      );

      const eventData = [
        {
          type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
          aggregate_id: {client_id: 'sample-client-id', name: 'client_contact_number'},
          data: {
            _id: 'id',
            type_id: command.type_id,
            contact_number: command.contact_number
          } as ClientContactNumberAddedEventStoreDataInterface,
          sequence_id: 3
        }
      ];

      repositoryClientContactNumber.save.getCall(0).args[0].should.deep.equal(eventData);
    });

    it('test that error is thrown when invariant checks fail', async () => {
      const clientId = 'sample-client-id';
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      aggregateClientContactNumber.validateAddClientContactNumberInvariants.rejects(new Error('some test error'));
      const handler = new AddClientContactNumberCommandHandler(repositoryClientContactNumber);
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };

      await handler.execute(clientId, command).should.be.rejectedWith(Error, 'some test error');
      aggregateClientContactNumber.validateAddClientContactNumberInvariants.should.have.been.calledOnceWith(
        command.type_id,
        command.contact_number
      );
      repositoryClientContactNumber.save.should.not.have.been.called;
      repositoryClientContactNumber.getAggregate.should.have.been.called;
    });

    it('test that error is thrown when events cannot be persisted/stored', async () => {
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      aggregateClientContactNumber.validateAddClientContactNumberInvariants.resolves();
      aggregateClientContactNumber.getLastEventId.returns(2);
      repositoryClientContactNumber.save.rejects(new Error('weird error'));
      const clientContactNumberAggregateId = {
        client_id: 'sample-client-id',
        name: 'client_contact_number'
      };

      aggregateClientContactNumber.getId.returns(clientContactNumberAggregateId);
      const clientId = 'sample-client-id';
      const handler = new AddClientContactNumberCommandHandler(repositoryClientContactNumber);
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };

      await handler.execute(clientId, command).should.be.rejectedWith(Error, 'weird error');
      aggregateClientContactNumber.validateAddClientContactNumberInvariants.should.have.been.calledOnceWith(
        command.type_id,
        command.contact_number
      );

      const eventData = [
        {
          type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
          aggregate_id: {client_id: 'sample-client-id', name: 'client_contact_number'},
          data: {
            _id: 'id',
            type_id: command.type_id,
            contact_number: command.contact_number
          },
          sequence_id: 3
        }
      ];

      repositoryClientContactNumber.save.getCall(0).args[0].should.deep.equal(eventData);
    });
  });
});
