import sinon, {stubConstructor} from 'ts-sinon';
import {AddContactNumberTypeCommandHandler} from '../../../src/aggregates/ContactNumberSetting/command-handlers/AddContactNumberTypeCommandHandler';
import {ContactNumberSettingCommandBus} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingCommandBus';
import {ContactNumberSettingRepository} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingCommandEnum} from '../../../src/aggregates/ContactNumberSetting/types';

describe('ContactNumberSettingCommandBus', () => {
  let commandBus: ContactNumberSettingCommandBus;
  let repository: ContactNumberSettingRepository;

  beforeEach(() => {
    commandBus = new ContactNumberSettingCommandBus();
    repository = stubConstructor(ContactNumberSettingRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addHandler()', () => {
    it('should return class instance', () => {
      const instance = commandBus.addHandler(new AddContactNumberTypeCommandHandler(repository));

      instance.should.deep.equal(commandBus);
    });
  });

  describe('execute()', () => {
    const command = {
      type: ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE,
      data: {
        _id: 'some id',
        name: 'OOH',
        order: 1
      }
    };

    it('should throw an error when there is no handler for the command', async () => {
      await commandBus.execute(command).should.be.rejectedWith(Error, `Command type:${command.type} is not supported`);
    });

    it('should use the correct handler', async () => {
      const handler = new AddContactNumberTypeCommandHandler(repository);
      const executeStub = sinon.stub(handler, 'execute');

      commandBus.addHandler(handler).addHandler(handler);
      executeStub.resolves();

      await commandBus.execute(command);
      executeStub.should.have.been.calledOnceWith(command.data);
    });
  });
});
