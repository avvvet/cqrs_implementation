import {ContactNumberSettingAggregate} from './ContactNumberSettingAggregate';
import {EventRepository, EventInterface} from '../../EventRepository';
import {ContactNumberSettingAggregateRecordInterface, ContactNumberSettingAggregateId} from './types';
import {EventStoreModelInterface} from '../../models/EventStore';
import {ContactNumberSettingWriteProjectionHandler} from './ContactNumberSettingWriteProjectionHandler';

/**
 * Class responsible for interacting with contact number setting aggregate data source
 */
export class ContactNumberSettingRepository {
  constructor(
    private eventRepository: EventRepository,
    private writeProjectionHandler: ContactNumberSettingWriteProjectionHandler
  ) {}

  /**
   * Build and returns ContactNumberSettingCommandBus
   */
  async getAggregate(sequenceId: number = undefined): Promise<ContactNumberSettingAggregate> {
    const projection: ContactNumberSettingAggregateRecordInterface = await this.eventRepository.leftFoldEvents(
      this.writeProjectionHandler,
      ContactNumberSettingAggregateId,
      sequenceId
    );

    return new ContactNumberSettingAggregate(ContactNumberSettingAggregateId, projection);
  }

  /**
   * Persist contact number setting related events into event store
   */
  async save(events: EventInterface[]): Promise<EventStoreModelInterface[]> {
    return this.eventRepository.save(events);
  }
}
