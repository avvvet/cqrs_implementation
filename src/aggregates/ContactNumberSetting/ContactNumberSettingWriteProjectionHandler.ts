import {WriteProjectionInterface} from '../../WriteProjectionInterface';
import {ContactNumberSettingAggregateRecordInterface, ContactNumberTypeInterface} from './types';
import {AddContactNumberTypeCommandDataInterface} from './types/CommandDataTypes';
import {EventStoreModelInterface} from '../../models/EventStore';
import {EventsEnum} from '../../Events';

/**
 * Responsible for handling all contact number setting events to build the current state of the aggregate
 */
export class ContactNumberSettingWriteProjectionHandler
implements WriteProjectionInterface<ContactNumberSettingAggregateRecordInterface> {
  execute(
    type: EventsEnum,
    aggregate: ContactNumberSettingAggregateRecordInterface,
    event: EventStoreModelInterface
  ): ContactNumberSettingAggregateRecordInterface {
    switch (type) {
      case EventsEnum.CONTACT_NUMBER_TYPE_ADDED: {
        const eventData = event.data as AddContactNumberTypeCommandDataInterface;
        const contactNumberType: ContactNumberTypeInterface = {
          _id: eventData._id,
          name: eventData.name,
          order: eventData.order
        };

        aggregate.contact_number_types
          ? aggregate.contact_number_types.push(contactNumberType)
          : (aggregate.contact_number_types = [contactNumberType]);

        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      default:
        throw new Error(`Event not supported ${type}`);
    }
  }
}
