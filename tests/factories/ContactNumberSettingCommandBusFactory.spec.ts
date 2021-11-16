import sinon, {stubConstructor} from 'ts-sinon';
import {AddContactNumberTypeCommandHandler} from '../../src/aggregates/ContactNumberSetting/command-handlers/AddContactNumberTypeCommandHandler';
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
      const addHandler = sinon.stub(ContactNumberSettingCommandBus.prototype, 'addHandler');
      const commandBus = ContactNumberSettingCommandBusFactory.getCommandBus(repository);

      addHandler.getCall(0).args[0].should.be.instanceof(AddContactNumberTypeCommandHandler);
      commandBus.should.to.instanceof(ContactNumberSettingCommandBus);
    });
  });
});