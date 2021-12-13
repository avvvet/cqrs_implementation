import sinon, {stubConstructor} from 'ts-sinon';
import {RemoveClientContactNumberCommandHandler} from '../../../../src/aggregates/ClientContactNumber/command-handlers';
import {ClientContactNumberAggregate} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberRepository} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberAggregateIdInterface} from '../../../../src/aggregates/ClientContactNumber/types';
import {RemoveClientContactNumberCommandDataInterface} from '../../../../src/aggregates/ClientContactNumber/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ClientContactNumberRemovedEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes';
import {ResourceNotFoundError} from 'a24-node-error-utils';

describe('RemoveClientContactNumberCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test success scenario repositoryClientContactNumber save persistes ', async () => {
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);

      aggregateClientContactNumber.clientContactNumberIdExists.returns(true);

      aggregateClientContactNumber.getLastEventId.returns(2);
      const clientContactNumberAggregateId = {
        client_id: 'sample-client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;

      aggregateClientContactNumber.getId.returns(clientContactNumberAggregateId);
      const clientId = 'sample-client-id';
      const handler = new RemoveClientContactNumberCommandHandler(repositoryClientContactNumber);
      const command: RemoveClientContactNumberCommandDataInterface = {
        _id: 'id'
      };

      await handler.execute(clientId, command);

      aggregateClientContactNumber.clientContactNumberIdExists.should.have.calledWith(command._id);

      const eventData = [
        {
          type: EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED,
          aggregate_id: {client_id: 'sample-client-id', name: 'client_contact_number'},
          data: {
            _id: 'id'
          } as ClientContactNumberRemovedEventStoreDataInterface,
          sequence_id: 3
        }
      ];

      repositoryClientContactNumber.save.getCall(0).args[0].should.deep.equal(eventData);
    });

    it('Test failure scenario : clientContactNumberIdExists', async () => {
      const clientId = 'sample-client-id';
      const command: RemoveClientContactNumberCommandDataInterface = {
        _id: 'id'
      };
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      aggregateClientContactNumber.clientContactNumberIdExists.returns(false);
      const handler = new RemoveClientContactNumberCommandHandler(repositoryClientContactNumber);

      const error = await handler
        .execute(clientId, command)
        .should.have.been.rejectedWith(ResourceNotFoundError, 'Not allowed. Client Contact number not found');

      aggregateClientContactNumber.clientContactNumberIdExists.should.have.calledOnceWith(command._id);
      repositoryClientContactNumber.save.should.not.have.been.called;
    });
  });
});
