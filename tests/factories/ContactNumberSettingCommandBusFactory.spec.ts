import sinon, {stubConstructor} from 'ts-sinon';
import {AddContactNumberTypeCommandHandler} from '../../src/aggregates/ContactNumberSetting/command-handlers/AddContactNumberTypeCommandHandler';
import {UpdateContactNumberTypeCommandHandler} from '../../src/aggregates/ContactNumberSetting/command-handlers/UpdateContactNumberTypeCommandHandler';
import {EnableContactNumberTypeCommandHandler} from '../../src/aggregates/ContactNumberSetting/command-handlers/EnableContactNumberTypeCommandHandler';
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
      commandBus.should.to.instanceof(ContactNumberSettingCommandBus);
    });
  });
});
