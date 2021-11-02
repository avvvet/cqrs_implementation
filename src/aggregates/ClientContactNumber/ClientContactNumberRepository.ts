import {ClientContactNumberAggregate} from './ClientContactNumberAggregate';
import {EventRepository, EventInterface} from '../../EventRepository';
import {ClientContactNumberAggregateRecordInterface} from './types';
import {EventStoreModelInterface} from '../../models/EventStore';
import {ClientContactNumberWriteProjectionHandler} from './ClientContactNumberWriteProjectionHandler';

/**
 * Class responsible for interacting with client contact number setting aggregate data source
 */
export class ClientContactNumberRepository {
  constructor(
    private eventRepository: EventRepository,
    private writeProjectionHandler: ClientContactNumberWriteProjectionHandler
  ) {}

  /**
   * Build and returns ContactNumberSettingCommandBus
   */
  async getAggregate(clientId: string, sequenceId: number = undefined): Promise<ClientContactNumberAggregate> {
    const projection: ClientContactNumberAggregateRecordInterface = await this.eventRepository.leftFoldEvents(
      this.writeProjectionHandler,
      {client_id: clientId, type: 'client_contact_number'},
      sequenceId
    );

    return new ClientContactNumberAggregate({client_id: clientId, type: 'client_contact_number'}, projection);
  }

  /**
   * Persist contact number setting related events into event store
   */
  async save(events: EventInterface[]): Promise<EventStoreModelInterface[]> {
    return this.eventRepository.save(events);
  }
}
