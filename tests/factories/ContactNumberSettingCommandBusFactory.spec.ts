import sinon, {stubConstructor} from 'ts-sinon';
import {
  AddContactNumberTypeCommandHandler,
  UpdateContactNumberTypeCommandHandler,
  EnableContactNumberTypeCommandHandler,
  DisableContactNumberTypeCommandHandler
} from '../../src/aggregates/ContactNumberSetting/command-handlers';
import {ContactNumberSettingCommandBus} from '../../src/aggregates/ContactNumberSetting/ContactNumberSettingCommandBus';
import {EventRepository} from '../../src/EventRepository';
import {ContactNumberSettingCommandBusFactory} from '../../src/factories/ContactNumberSettingCommandBusFactory';

describe('ContactNumberSettingCommandBusFactory', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('getCommandBus', () => {
    it('Test success', () => {
      const repository = stubConstructor(EventRepository);
      const addHandler = sinon.spy(ContactNumberSettingCommandBus.prototype, 'addHandler');
      const commandBus = ContactNumberSettingCommandBusFactory.getCommandBus(repository);

      addHandler.getCall(0).args[0].should.be.instanceof(AddContactNumberTypeCommandHandler);
      addHandler.getCall(1).args[0].should.be.instanceof(UpdateContactNumberTypeCommandHandler);
      addHandler.getCall(2).args[0].should.be.instanceof(EnableContactNumberTypeCommandHandler);
      addHandler.getCall(3).args[0].should.be.instanceof(DisableContactNumberTypeCommandHandler);
      commandBus.should.to.instanceof(ContactNumberSettingCommandBus);
    });
  });
});
