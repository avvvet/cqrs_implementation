import {ClientContactNumberCommandEnum} from '../../../src/aggregates/ClientContactNumber/types';
import {ClientContactNumberCommandBusFactory} from '../../../src/factories/ClientContactNumberCommandBusFactory';
import {AbstractScenario} from './AbstractScenario';

export class ClientContactNumberScenario extends AbstractScenario {
  async createClientContactNumber(client_id: string): Promise<void> {
    await ClientContactNumberCommandBusFactory.getCommandBus(this.eventRepository).execute(client_id, {
      type: ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER,
      data: {
        _id: '61b01b90ec281fb7d43262ae',
        type_id: 'sample-type-id',
        contact_number: '0911'
      }
    });
  }
}
