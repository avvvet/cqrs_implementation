import sinon, {stubConstructor} from 'ts-sinon';
import {AddClientContactNumberCommandHandler} from '../../../../src/aggregates/ClientContactNumber/command-handlers';
import {ContactNumberSettingAggregate} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {ContactNumberSettingRepository} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ClientContactNumberAggregate} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberRepository} from '../../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberAggregateIdInterface} from '../../../../src/aggregates/ClientContactNumber/types';
import {AddClientContactNumberCommandDataInterface} from '../../../../src/aggregates/ClientContactNumber/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ClientContactNumberAddedEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes';
import {ValidationError} from 'a24-node-error-utils';

describe('AddClientContactNumberCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test success scenario', async () => {
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const repositoryContactNumberSetting = stubConstructor(ContactNumberSettingRepository);

      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);
      const aggregateContactNumberSetting = stubConstructor(ContactNumberSettingAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      repositoryContactNumberSetting.getAggregate.resolves(aggregateContactNumberSetting);

      repositoryClientContactNumber.save.resolves();
      repositoryContactNumberSetting.save.resolves();

      aggregateContactNumberSetting.contactNumberTypeExists.returns(true);
      aggregateContactNumberSetting.contactNumberTypeEnabled.returns(true);
      aggregateClientContactNumber.clientContactNumberExists.returns(false);

      aggregateClientContactNumber.getLastEventId.returns(2);
      const clientContactNumberAggregateId = {
        client_id: 'sample-client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;

      aggregateClientContactNumber.getId.returns(clientContactNumberAggregateId);
      const clientId = 'sample-client-id';
      const handler = new AddClientContactNumberCommandHandler(
        repositoryClientContactNumber,
        repositoryContactNumberSetting
      );
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };

      await handler.execute(clientId, command);

      aggregateContactNumberSetting.contactNumberTypeEnabled.should.have.been.calledWith(command.type_id);
      aggregateContactNumberSetting.contactNumberTypeExists.should.have.been.calledWith(command.type_id);
      aggregateClientContactNumber.clientContactNumberExists.should.have.been.calledWith(command.contact_number);

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

    it('Test failure scenario : contactNumberTypeEnabled and clientContactNumberExists', async () => {
      const clientId = 'sample-client-id';
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const repositoryContactNumberSetting = stubConstructor(ContactNumberSettingRepository);

      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);
      const aggregateContactNumberSetting = stubConstructor(ContactNumberSettingAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      repositoryContactNumberSetting.getAggregate.resolves(aggregateContactNumberSetting);

      aggregateContactNumberSetting.contactNumberTypeExists.returns(false);
      const handler = new AddClientContactNumberCommandHandler(
        repositoryClientContactNumber,
        repositoryContactNumberSetting
      );

      const error = await handler
        .execute(clientId, command)
        .should.have.been.rejectedWith(ValidationError, 'Not allowed. Contact number type not exists');

      error.should.deep.equal(
        new ValidationError('Not allowed. Contact number type not exists', [
          {
            code: 'CONTACT_NUMBR_TYPE_NOT_FOUND',
            message: `contact number type '${command.type_id}' not exists.`,
            path: ['type_id']
          }
        ])
      );

      aggregateContactNumberSetting.contactNumberTypeExists.should.have.been.calledWith(command.type_id);
      aggregateContactNumberSetting.contactNumberTypeEnabled.should.have.not.called;
      aggregateClientContactNumber.clientContactNumberExists.should.have.not.called;
      repositoryClientContactNumber.save.should.have.not.called;
    });

    it('Test failure scenario : clientContactNumberExists', async () => {
      const clientId = 'sample-client-id';
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const repositoryContactNumberSetting = stubConstructor(ContactNumberSettingRepository);

      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);
      const aggregateContactNumberSetting = stubConstructor(ContactNumberSettingAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      repositoryContactNumberSetting.getAggregate.resolves(aggregateContactNumberSetting);

      aggregateContactNumberSetting.contactNumberTypeExists.returns(true);
      aggregateContactNumberSetting.contactNumberTypeEnabled.returns(false);
      const handler = new AddClientContactNumberCommandHandler(
        repositoryClientContactNumber,
        repositoryContactNumberSetting
      );

      const error = await handler
        .execute(clientId, command)
        .should.have.been.rejectedWith(ValidationError, 'Not allowed. Contact number type is disabled');

      error.should.deep.equal(
        new ValidationError('Not allowed. Contact number type is disabled', [
          {
            code: 'CONTACT_NUMBER_TYPE_DISABLED',
            message: `contact number type '${command.type_id}' is disabled.`,
            path: ['type_id']
          }
        ])
      );

      aggregateContactNumberSetting.contactNumberTypeExists.should.have.been.calledWith(command.type_id);
      aggregateContactNumberSetting.contactNumberTypeEnabled.should.have.been.calledWith(command.type_id);
      aggregateClientContactNumber.clientContactNumberExists.should.have.not.called;
      repositoryClientContactNumber.save.should.have.not.called;
    });

    it('Test failure scenario', async () => {
      const clientId = 'sample-client-id';
      const command: AddClientContactNumberCommandDataInterface = {
        _id: 'id',
        type_id: 'name',
        contact_number: '0911'
      };
      const repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
      const repositoryContactNumberSetting = stubConstructor(ContactNumberSettingRepository);

      const aggregateClientContactNumber = stubConstructor(ClientContactNumberAggregate);
      const aggregateContactNumberSetting = stubConstructor(ContactNumberSettingAggregate);

      repositoryClientContactNumber.getAggregate.resolves(aggregateClientContactNumber);
      repositoryContactNumberSetting.getAggregate.resolves(aggregateContactNumberSetting);

      aggregateContactNumberSetting.contactNumberTypeExists.returns(true);
      aggregateContactNumberSetting.contactNumberTypeEnabled.returns(true);
      aggregateClientContactNumber.clientContactNumberExists.returns(true);
      const handler = new AddClientContactNumberCommandHandler(
        repositoryClientContactNumber,
        repositoryContactNumberSetting
      );

      const error = await handler
        .execute(clientId, command)
        .should.have.been.rejectedWith(ValidationError, 'Not allowed. Client Contact number exists');

      error.should.deep.equal(
        new ValidationError('Not allowed. Client Contact number exists', [
          {
            code: 'CONTACT_NUMBER_ALREADY_EXISTS',
            message: `Client contact number '${command.contact_number}' already exists.`,
            path: ['contact_number']
          }
        ])
      );
      aggregateContactNumberSetting.contactNumberTypeExists.should.have.been.calledWith(command.type_id);
      aggregateContactNumberSetting.contactNumberTypeEnabled.should.have.been.calledWith(command.type_id);
      aggregateClientContactNumber.clientContactNumberExists.should.have.been.calledWith(command.contact_number);
      repositoryClientContactNumber.save.should.have.not.called;
    });
  });
});
