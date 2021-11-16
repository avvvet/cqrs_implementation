import sinon, {stubConstructor} from 'ts-sinon';
import {UpdateContactNumberTypeCommandHandler} from '../../../../src/aggregates/ContactNumberSetting/command-handlers/UpdateContactNumberTypeCommandHandler';
import {ContactNumberSettingAggregate} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {ContactNumberSettingRepository} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingAggregateId} from '../../../../src/aggregates/ContactNumberSetting/types';
import {UpdateContactNumberTypeCommandDataInterface} from '../../../../src/aggregates/ContactNumberSetting/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ContactNumberTypeUpdatedEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes/ContactNumberTypeUpdatedEventStoreDataInterface';

describe('UpdateContactNumberTypeCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test success scenario', async () => {
      const repository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);

      repository.getAggregate.resolves(aggregate);
      repository.save.resolves();
      aggregate.validateUpdateContactNumberType.resolves();
      aggregate.getLastEventId.returns(2);
      aggregate.getId.returns(ContactNumberSettingAggregateId);
      const handler = new UpdateContactNumberTypeCommandHandler(repository);
      const command: UpdateContactNumberTypeCommandDataInterface = {
        _id: 'id',
        name: 'name',
        order: 2
      };

      await handler.execute(command);
      aggregate.validateUpdateContactNumberType.should.have.been.calledWith(command);
      repository.save.getCall(0).args[0].should.deep.equal([
        {
          type: EventsEnum.CONTACT_NUMBER_TYPE_UPDATED,
          aggregate_id: ContactNumberSettingAggregateId,
          data: {
            _id: command._id,
            name: command.name,
            order: command.order
          } as ContactNumberTypeUpdatedEventStoreDataInterface,
          sequence_id: 3
        }
      ]);
    });

    it('Test failure scenario', async () => {
      const repository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);
      const error = new Error('sample');

      repository.getAggregate.resolves(aggregate);
      repository.save.resolves();
      aggregate.validateUpdateContactNumberType.rejects(error);
      aggregate.getLastEventId.returns(2);
      aggregate.getId.returns(ContactNumberSettingAggregateId);
      const handler = new UpdateContactNumberTypeCommandHandler(repository);
      const command: UpdateContactNumberTypeCommandDataInterface = {
        _id: 'id',
        name: 'name',
        order: 2
      };

      await handler.execute(command).should.have.been.rejectedWith(error);
      aggregate.validateUpdateContactNumberType.should.have.been.calledWith(command);
      repository.save.should.not.have.been.called;
    });
  });
});
