import {ClientContactNumberAggregate} from './ClientContactNumberAggregate';
import {EventRepository, EventInterface} from '../../EventRepository';
import {ClientContactNumberAggregateRecordInterface} from './types';
import {EventStoreModelInterface} from '../../models/EventStore';
import {ClientContactNumberWriteProjectionHandler} from './ClientContactNumberWriteProjectionHandler';
import {ContactNumberSettingRepository, ContactNumberSettingWriteProjectionHandler} from '../ContactNumberSetting';

/**
 * Class responsible for aggregate retrieval and saving events to event store
 */
export class ClientContactNumberRepository {
  private static readonly AGGREGATE_ID_NAME = 'client_contact_number';

  constructor(
    private eventRepository: EventRepository,
    private writeProjectionHandler: ClientContactNumberWriteProjectionHandler,
    private contactNumberSettingRepository: ContactNumberSettingRepository
  ) {}

  /**
   * Build and returns an aggregate
   */
  async getAggregate(clientId: string, sequenceId: number = undefined): Promise<ClientContactNumberAggregate> {
    const projection: ClientContactNumberAggregateRecordInterface = await this.eventRepository.leftFoldEvents(
      this.writeProjectionHandler,
      {client_id: clientId, name: ClientContactNumberRepository.AGGREGATE_ID_NAME},
      sequenceId
    );

    return new ClientContactNumberAggregate(
      {client_id: clientId, name: ClientContactNumberRepository.AGGREGATE_ID_NAME},
      projection,
      this.contactNumberSettingRepository
    );
  }

  /**
   * Persist client contact number related events into event store
   */
  async save(events: EventInterface[]): Promise<EventStoreModelInterface[]> {
    return this.eventRepository.save(events);
  }
}
