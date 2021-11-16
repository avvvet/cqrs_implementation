import {WriteProjectionInterface} from '../../WriteProjectionInterface';
import {ClientContactNumberAggregateRecordInterface, ClientContactNumberInterface} from './types';
import {AddClientContactNumberCommandDataInterface} from './types/CommandDataTypes';
import {EventStoreModelInterface} from '../../models/EventStore';
import {EventsEnum} from '../../Events';

/**
 * Responsible for handling all client contact number events to build the current state of the aggregate
 */
export class ClientContactNumberWriteProjectionHandler
implements WriteProjectionInterface<ClientContactNumberAggregateRecordInterface> {
  execute(
    type: EventsEnum,
    aggregate: ClientContactNumberAggregateRecordInterface,
    event: EventStoreModelInterface
  ): ClientContactNumberAggregateRecordInterface {
    switch (type) {
      case EventsEnum.CLIENT_CONTACT_NUMBER_ADDED: {
        const eventData = event.data as AddClientContactNumberCommandDataInterface;
        const contactNumber: ClientContactNumberInterface = {
          _id: eventData._id,
          type_id: eventData.type_id,
          number: eventData.number
        };

        aggregate.contact_numbers
          ? aggregate.contact_numbers.push(contactNumber)
          : (aggregate.contact_numbers = [contactNumber]);

        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      default:
        throw new Error(`Event not supported ${type}`);
    }
  }
}