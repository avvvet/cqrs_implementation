import {WriteProjectionInterface} from '../../WriteProjectionInterface';
import {ClientContactNumberAggregateRecordInterface, ClientContactNumberInterface} from './types';
import {EventStoreModelInterface} from '../../models/EventStore';
import {EventsEnum} from '../../Events';
import {ClientContactNumberAddedEventStoreDataInterface} from 'EventStoreDataTypes';

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
        const eventData = event.data as ClientContactNumberAddedEventStoreDataInterface;
        const contactNumber: ClientContactNumberInterface = {
          _id: eventData._id,
          client_id: eventData.client_id,
          type_id: eventData.type_id,
          contact_number: eventData.contact_number
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
