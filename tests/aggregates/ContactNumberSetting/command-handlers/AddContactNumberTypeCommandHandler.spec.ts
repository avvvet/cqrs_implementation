import sinon, {stubConstructor} from 'ts-sinon';
import {AddContactNumberTypeCommandHandler} from '../../../../src/aggregates/ContactNumberSetting/command-handlers/AddContactNumberTypeCommandHandler';
import {ContactNumberSettingAggregate} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {ContactNumberSettingRepository} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingAggregateId} from '../../../../src/aggregates/ContactNumberSetting/types';
import {AddContactNumberTypeCommandDataInterface} from '../../../../src/aggregates/ContactNumberSetting/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ContactNumberTypeAddedEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes';
import {ContactNumberTypeEnabledEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes/ContactNumberTypeEnabledEventStoreDataInterface';

describe('AddContactNumberTypeCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test success scenario', async () => {
      const repository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);

      repository.getAggregate.resolves(aggregate);
      repository.save.resolves();
      aggregate.validateAddContactNumberType.resolves();
      aggregate.getLastEventId.returns(2);
      aggregate.getId.returns(ContactNumberSettingAggregateId);
      const handler = new AddContactNumberTypeCommandHandler(repository);
      const command: AddContactNumberTypeCommandDataInterface = {
        _id: 'id',
        name: 'name',
        order: 2
      };

      await handler.execute(command);
      aggregate.validateAddContactNumberType.should.have.been.calledWith(command);
      repository.save.getCall(0).args[0].should.deep.equal([
        {
          type: EventsEnum.CONTACT_NUMBER_TYPE_ADDED,
          aggregate_id: ContactNumberSettingAggregateId,
          data: {
            _id: command._id,
            name: command.name,
            order: command.order
          } as ContactNumberTypeAddedEventStoreDataInterface,
          sequence_id: 3
        },
        {
          type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
          aggregate_id: ContactNumberSettingAggregateId,
          data: {
            _id: command._id
          } as ContactNumberTypeEnabledEventStoreDataInterface,
          sequence_id: 4
        }
      ]);
    });

    it('Test failure scenario', async () => {
      const repository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);
      const error = new Error('sample');

      repository.getAggregate.resolves(aggregate);
      repository.save.resolves();
      aggregate.validateAddContactNumberType.rejects(error);
      aggregate.getLastEventId.returns(2);
      aggregate.getId.returns(ContactNumberSettingAggregateId);
      const handler = new AddContactNumberTypeCommandHandler(repository);
      const command: AddContactNumberTypeCommandDataInterface = {
        _id: 'id',
        name: 'name',
        order: 2
      };

      await handler.execute(command).should.have.been.rejectedWith(error);
      aggregate.validateAddContactNumberType.should.have.been.calledWith(command);
      repository.save.should.not.have.been.called;
    });
  });
});
