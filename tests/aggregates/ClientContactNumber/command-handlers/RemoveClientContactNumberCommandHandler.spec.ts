import sinon, {stubConstructor} from 'ts-sinon';
import {RemoveClientContactNumberCommandHandler} from '../../../../src/aggregates/ClientContactNumber/command-handlers';
import {ClientContactNumberAggregate} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberRepository} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberAggregateIdInterface} from '../../../../src/aggregates/ClientContactNumber/types';
import {RemoveClientContactNumberCommandDataInterface} from '../../../../src/aggregates/ClientContactNumber/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ClientContactNumberRemovedEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes';
import {ValidationError} from 'a24-node-error-utils';

describe('RemoveClientContactNumberCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test success scenario', async () => {
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);

      aggregateClientContactNumber.isClientContactNumberIdExists.returns(true);
      aggregateClientContactNumber.isClientContactNumberRemoved.returns(false);

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

      aggregateClientContactNumber.isClientContactNumberIdExists.should.have.calledOnce;
      aggregateClientContactNumber.isClientContactNumberRemoved.should.have.calledWith(command._id);

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

    it('Test failure scenario : isClientContactNumberIdExists', async () => {
      const clientId = 'sample-client-id';
      const command: RemoveClientContactNumberCommandDataInterface = {
        _id: 'id'
      };
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      aggregateClientContactNumber.isClientContactNumberIdExists.returns(false);
      const handler = new RemoveClientContactNumberCommandHandler(repositoryClientContactNumber);

      const error = await handler
        .execute(clientId, command)
        .should.have.been.rejectedWith(ValidationError, 'Not allowed. Client Contact number not found');

      error.should.deep.equal(
        new ValidationError('Not allowed. Client Contact number not found', [
          {
            code: 'CONTACT_NUMBER_NOT_FOUND',
            message: `Client contact number id '${command._id}' not found.`,
            path: ['_id']
          }
        ])
      );

      aggregateClientContactNumber.isClientContactNumberRemoved.should.have.not.called;
      repositoryClientContactNumber.save.should.not.have.been.called;
    });

    it('Test failure scenario : isClientContactNumberRemoved', async () => {
      const clientId = 'sample-client-id';
      const command: RemoveClientContactNumberCommandDataInterface = {
        _id: 'id'
      };
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      aggregateClientContactNumber.isClientContactNumberIdExists.returns(true);
      aggregateClientContactNumber.isClientContactNumberRemoved.returns(true);
      const handler = new RemoveClientContactNumberCommandHandler(repositoryClientContactNumber);

      const error = await handler
        .execute(clientId, command)
        .should.have.been.rejectedWith(ValidationError, 'Not allowed. Client Contact number already removed');

      error.should.deep.equal(
        new ValidationError('Not allowed. Client Contact number already removed', [
          {
            code: 'CONTACT_NUMBER_ALREADY_REMOVED',
            message: `Client contact number id '${command._id}' already removed.`,
            path: ['_id']
          }
        ])
      );

      aggregateClientContactNumber.isClientContactNumberIdExists.should.have.calledOnce;
      aggregateClientContactNumber.isClientContactNumberRemoved.should.have.calledOnce;
      repositoryClientContactNumber.save.should.not.have.been.called;
    });
  });
});
