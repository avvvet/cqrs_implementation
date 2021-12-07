import sinon, {stubConstructor} from 'ts-sinon';
import {
  AddClientContactNumberCommandHandler,
  RemoveClientContactNumberCommandHandler
} from '../../src/aggregates/ClientContactNumber/command-handlers';
import {ClientContactNumberCommandBus} from '../../src/aggregates/ClientContactNumber/ClientContactNumberCommandBus';
import {EventRepository} from '../../src/EventRepository';
import {ClientContactNumberCommandBusFactory} from '../../src/factories/ClientContactNumberCommandBusFactory';

describe('ClientContactNumberCommandBusFactory', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('getCommandBus', () => {
    it('Test success', () => {
      const repository = stubConstructor(EventRepository);
      const addHandler = sinon.spy(ClientContactNumberCommandBus.prototype, 'addHandler');
      const commandBus = ClientContactNumberCommandBusFactory.getCommandBus(repository);

      addHandler.getCall(0).args[0].should.be.instanceof(AddClientContactNumberCommandHandler);
      addHandler.getCall(1).args[0].should.be.instanceof(RemoveClientContactNumberCommandHandler);
      commandBus.should.to.instanceof(ClientContactNumberCommandBus);
    });
  });
});
