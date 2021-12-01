import {assert} from 'chai';
import sinon, {stubConstructor} from 'ts-sinon';
import {DisableContactNumberTypeCommandHandler} from '../../../../src/aggregates/ContactNumberSetting/command-handlers';
import {ContactNumberSettingAggregate} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingAggregate';
import {ContactNumberSettingRepository} from '../../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingAggregateId} from '../../../../src/aggregates/ContactNumberSetting/types';
import {DisableContactNumberTypeCommandDataInterface} from '../../../../src/aggregates/ContactNumberSetting/types/CommandDataTypes';
import {EventsEnum} from '../../../../src/Events';
import {ContactNumberSettingCommandEnum} from '../../../../src/aggregates/ContactNumberSetting/types/index';
import {ContactNumberTypeDisabledEventStoreDataInterface} from '../../../../src/types/EventStoreDataTypes/ContactNumberTypeDisabledEventStoreDataInterface';

describe('DisableContactNumberTypeCommandHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('execute()', () => {
    it('Test correct events are persisted', async () => {
      const contactNumberTypeId = 'some-id';
      const commandData = {
        _id: contactNumberTypeId
      } as DisableContactNumberTypeCommandDataInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingRepository.save.resolves();
      contactNumberSettingRepository.getAggregate.resolves(aggregate);
      aggregate.getLastEventId.returns(100);
      aggregate.getId.returns(ContactNumberSettingAggregateId);
      aggregate.canDisableContactNumberType.returns(true);
      const handler = new DisableContactNumberTypeCommandHandler(contactNumberSettingRepository);

      assert.equal(
        handler.commandType,
        ContactNumberSettingCommandEnum.DISABLE_CONTACT_NUMBER_TYPE,
        'Expected command type to match'
      );
      await handler.execute(commandData);

      contactNumberSettingRepository.save.should.have.been.calledWith([
        {
          type: EventsEnum.CONTACT_NUMBER_TYPE_DISABLED,
          aggregate_id: ContactNumberSettingAggregateId,
          data: {
            _id: commandData._id
          } as ContactNumberTypeDisabledEventStoreDataInterface,
          sequence_id: 101
        }
      ]);

      contactNumberSettingRepository.getAggregate.should.have.been.calledOnce;
      aggregate.canDisableContactNumberType.should.have.calledOnceWith(contactNumberTypeId);
    });

    it('Test failure scenario', async () => {
      const contactNumberTypeId = 'some-id';
      const commandData = {
        _id: contactNumberTypeId
      } as DisableContactNumberTypeCommandDataInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingRepository.getAggregate.resolves(aggregate);
      aggregate.getLastEventId.returns(100);
      aggregate.canDisableContactNumberType.returns(false);
      const handler = new DisableContactNumberTypeCommandHandler(contactNumberSettingRepository);

      assert.equal(
        handler.commandType,
        ContactNumberSettingCommandEnum.DISABLE_CONTACT_NUMBER_TYPE,
        'Expected command type to match'
      );
      await handler.execute(commandData);

      assert.isFalse(contactNumberSettingRepository.save.called, 'Save must not be called');
      contactNumberSettingRepository.getAggregate.should.have.been.calledOnce;
      aggregate.canDisableContactNumberType.should.have.calledOnceWith(contactNumberTypeId);
    });
  });
});
