import sinon, {stubConstructor} from 'ts-sinon';
import {
  AddClientContactNumberCommandHandler,
  RemoveClientContactNumberCommandHandler
} from '../../../src/aggregates/ClientContactNumber/command-handlers';
import {ClientContactNumberCommandBus} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberCommandBus';
import {ClientContactNumberRepository} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberRepository';
import {ClientContactNumberCommandEnum} from '../../../src/aggregates/ClientContactNumber/types';

describe('ClientContactNumberCommandBus', () => {
  let commandBus: ClientContactNumberCommandBus;
  let repositoryClientContactNumber: ClientContactNumberRepository;

  beforeEach(() => {
    commandBus = new ClientContactNumberCommandBus();
    repositoryClientContactNumber = stubConstructor(ClientContactNumberRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addHandler()', () => {
    it('should return class instance', () => {
      const instance = commandBus.addHandler(new AddClientContactNumberCommandHandler(repositoryClientContactNumber));

      instance.should.deep.equal(commandBus);
    });
  });

  describe('execute()', () => {
    it('should throw an error when there is no handler for the command AddClientContactNumberCommandHandler', async () => {
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

      await commandBus
        .execute(clientId, command)
        .should.be.rejectedWith(Error, `Command type:${command.type} is not supported`);
    });

    it('should throw an error when there is no handler for the command RemoveClientContactNumberCommandHandler', async () => {
      const clientId = 'client-id';
      const command = {
        type: ClientContactNumberCommandEnum.REMOVE_CLIENT_CONTACT_NUMBER,
        data: {
          _id: 'id',
          client_id: 'client-id',
          type_id: 'name',
          contact_number: '0911'
        }
      };

      await commandBus
        .execute(clientId, command)
        .should.be.rejectedWith(Error, `Command type:${command.type} is not supported`);
    });

    it('should use the correct handler AddClientContactNumberCommandHandler', async () => {
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
      const handler = new AddClientContactNumberCommandHandler(repositoryClientContactNumber);
      const executeStub = sinon.stub(handler, 'execute');

      commandBus.addHandler(handler);
      executeStub.resolves();

      await commandBus.execute(clientId, command);
      executeStub.should.have.been.calledOnceWith(clientId, command.data);
    });

    it('should use the correct handler RemoveClientContactNumberCommandHandler', async () => {
      const clientId = 'client-id';
      const command = {
        type: ClientContactNumberCommandEnum.REMOVE_CLIENT_CONTACT_NUMBER,
        data: {
          _id: 'id',
          client_id: 'client-id',
          type_id: 'name',
          contact_number: '0911'
        }
      };

      const handler = new RemoveClientContactNumberCommandHandler(repositoryClientContactNumber);
      const executeStub = sinon.stub(handler, 'execute');

      commandBus.addHandler(handler);
      executeStub.resolves();

      await commandBus.execute(clientId, command);
      executeStub.should.have.been.calledOnceWith(clientId, command.data);
    });
  });
});
