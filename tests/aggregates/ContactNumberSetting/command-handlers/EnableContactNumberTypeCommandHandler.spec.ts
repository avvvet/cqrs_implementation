import {assert} from 'chai';
import sinon, {stubConstructor} from 'ts-sinon';
import {EnableContactNumberTypeCommandHandler} from '../../../../src/aggregates/ContactNumberSetting/command-handlers/EnableContactNumberTypeCommandHandler';
import {ContactNumberSettingAggregate} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {ContactNumberSettingRepository} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingAggregateId} from '../../../../src/aggregates/ContactNumberSetting/types';
import {EnableContactNumberTypeCommandDataInterface} from '../../../../src/aggregates/ContactNumberSetting/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ContactNumberSettingCommandEnum} from '../../../../src/aggregates/ContactNumberSetting/types/index';
import {ContactNumberTypeEnabledEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes/ContactNumberTypeEnabledEventStoreDataInterface';

describe('EnableContactNumberTypeCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test correct events are persisted', async () => {
      const contactNumberTypeId = 'some-id';
      const commandData = {
        _id: contactNumberTypeId
      } as EnableContactNumberTypeCommandDataInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingRepository.save.resolves();
      contactNumberSettingRepository.getAggregate.resolves(aggregate);
      aggregate.getLastEventId.returns(100);
      aggregate.getId.returns(ContactNumberSettingAggregateId);
      aggregate.canEnableContactNumberType.returns(true);
      const handler = new EnableContactNumberTypeCommandHandler(contactNumberSettingRepository);

      assert.equal(
        handler.commandType,
        ContactNumberSettingCommandEnum.ENABLE_CONTACT_NUMBER_TYPE,
        'Expected command type to match'
      );
      await handler.execute(commandData);

      contactNumberSettingRepository.save.should.have.been.calledWith([
        {
          type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
          aggregate_id: ContactNumberSettingAggregateId,
          data: {
            _id: commandData._id
          } as ContactNumberTypeEnabledEventStoreDataInterface,
          sequence_id: 101
        }
      ]);

      contactNumberSettingRepository.getAggregate.should.have.been.calledOnce;
      aggregate.canEnableContactNumberType.should.have.calledOnceWith(contactNumberTypeId);
    });

    it('Test failure scenario', async () => {
      const contactNumberTypeId = 'some-id';
      const commandData = {
        _id: contactNumberTypeId
      } as EnableContactNumberTypeCommandDataInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingRepository.getAggregate.resolves(aggregate);
      aggregate.getLastEventId.returns(100);
      aggregate.canEnableContactNumberType.returns(false);
      const handler = new EnableContactNumberTypeCommandHandler(contactNumberSettingRepository);

      assert.equal(
        handler.commandType,
        ContactNumberSettingCommandEnum.ENABLE_CONTACT_NUMBER_TYPE,
        'Expected command type to match'
      );
      await handler.execute(commandData);

      assert.isFalse(contactNumberSettingRepository.save.called, 'Save must not be called');
      contactNumberSettingRepository.getAggregate.should.have.been.calledOnce;
      aggregate.canEnableContactNumberType.should.have.calledOnceWith(contactNumberTypeId);
    });
  });
});
