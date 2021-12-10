import sinon, {stubConstructor} from 'ts-sinon';
import {AddClientContactNumberCommandHandler} from '../../../src/aggregates/ClientContactNumber/command-handlers/AddClientContactNumberCommandHandler';
import {ClientContactNumberCommandBus} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberCommandBus';
import {ClientContactNumberRepository} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ContactNumberSettingRepository} from '../../../src/aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ClientContactNumberCommandEnum} from '../../../src/aggregates/ClientContactNumber/types';

describe('ClientContactNumberCommandBus', () => {
  let commandBus: ClientContactNumberCommandBus;
  let repositoryClientContactNumber: ClientContactNumberRepository;
  let repositoryContactNumberSetting: ContactNumberSettingRepository;

  beforeEach(() => {
    commandBus = new ClientContactNumberCommandBus();
    repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
    repositoryContactNumberSetting = stubConstructor(ContactNumberSettingRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addHandler()', () => {
    it('should return class instance', () => {
      const instance = commandBus.addHandler(
        new AddClientContactNumberCommandHandler(repositoryClientContactNumber, repositoryContactNumberSetting)
      );

      instance.should.deep.equal(commandBus);
    });
  });

  describe('execute()', () => {
    const clientId = 'client-id';
    const command = {
      type: ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER,
      data: {
        _id: 'id',
        client_id: 'client-id',
        type_id: 'name',
        contact_number: '0911'
      }
    };

    it('should throw an error when there is no handler for the command', async () => {
      await commandBus
        .execute(clientId, command)
        .should.be.rejectedWith(Error, `Command type:${command.type} is not supported`);
    });

    it('should use the correct handler', async () => {
      const handler = new AddClientContactNumberCommandHandler(
        repositoryClientContactNumber,
        repositoryContactNumberSetting
      );
      const executeStub = sinon.stub(handler, 'execute');

      commandBus.addHandler(handler);
      executeStub.resolves();

      await commandBus.execute(clientId, command);
      executeStub.should.have.been.calledOnceWith(clientId, command.data);
    });
  });
});
