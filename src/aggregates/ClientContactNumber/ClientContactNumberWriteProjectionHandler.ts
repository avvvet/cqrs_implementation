import {WriteProjectionInterface} from '../../WriteProjectionInterface';
import {differenceWith} from 'lodash';
import {ClientContactNumberAggregateRecordInterface, ClientContactNumberInterface} from './types';
import {EventStoreModelInterface} from '../../models/EventStore';
import {EventsEnum} from '../../Events';
import {
  ClientContactNumberAddedEventStoreDataInterface,
  ClientContactNumberRemovedEventStoreDataInterface
} from 'EventStoreDataTypes';

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
          type_id: eventData.type_id,
          contact_number: eventData.contact_number
        };

        aggregate.contact_numbers
          ? aggregate.contact_numbers.push(contactNumber)
          : (aggregate.contact_numbers = [contactNumber]);

        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      case EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED: {
        const eventData = event.data as ClientContactNumberRemovedEventStoreDataInterface;

        /**
         *  we are using the differenceWith, to take off the client contact number from the existing
         *  aggregate contact_numbers list build up.
         */
        aggregate.contact_numbers = differenceWith(
          aggregate.contact_numbers,
          [eventData],
          (value, other) => value._id == other._id
        );

        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      default:
        throw new Error(`Event not supported ${type}`);
    }
  }
}
