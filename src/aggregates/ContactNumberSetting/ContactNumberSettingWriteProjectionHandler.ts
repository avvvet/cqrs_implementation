import {
  ContactNumberTypeAddedEventStoreDataInterface,
  ContactNumberTypeUpdatedEventStoreDataInterface,
  ContactNumberTypeEnabledEventStoreDataInterface,
  ContactNumberTypeDisabledEventStoreDataInterface
} from 'EventStoreDataTypes';
import {map, merge} from 'lodash';
import {EventsEnum} from '../../Events';
import {EventStoreModelInterface} from '../../models/EventStore';
import {WriteProjectionInterface} from '../../WriteProjectionInterface';
import {
  ContactNumberSettingAggregateRecordInterface,
  ContactNumberTypeInterface,
  ContactNumberTypeStatusEnum
} from './types';

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
        const eventData = event.data as ContactNumberTypeAddedEventStoreDataInterface;
        const contactNumberType: ContactNumberTypeInterface = {
          _id: eventData._id,
          name: eventData.name,
          order: eventData.order
        };

        aggregate.types ? aggregate.types.push(contactNumberType) : (aggregate.types = [contactNumberType]);

        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      case EventsEnum.CONTACT_NUMBER_TYPE_ENABLED: {
        const eventData = event.data as ContactNumberTypeEnabledEventStoreDataInterface;

        aggregate.types = map(aggregate.types, (contactNumberType) => {
          if (contactNumberType._id === eventData._id) {
            contactNumberType.status = ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_ENABLED;
          }
          return contactNumberType;
        });
        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      case EventsEnum.CONTACT_NUMBER_TYPE_DISABLED: {
        const eventData = event.data as ContactNumberTypeDisabledEventStoreDataInterface;

        aggregate.types = map(aggregate.types, (contactNumberType) => {
          if (contactNumberType._id === eventData._id) {
            contactNumberType.status = ContactNumberTypeStatusEnum.CONTACT_NUMBER_TYPE_STATUS_DISABLED;
          }
          return contactNumberType;
        });
        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      case EventsEnum.CONTACT_NUMBER_TYPE_UPDATED: {
        const eventData = event.data as ContactNumberTypeUpdatedEventStoreDataInterface;

        aggregate.types = map(aggregate.types, (contactNumberType) => {
          if (contactNumberType._id === eventData._id) {
            merge(contactNumberType, eventData);
          }
          return contactNumberType;
        });
        return {...aggregate, last_sequence_id: event.sequence_id};
      }
      default:
        throw new Error(`Event not supported ${type}`);
    }
  }
}
