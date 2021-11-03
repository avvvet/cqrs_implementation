import {ClientContactNumberAggregate} from './ClientContactNumberAggregate';
import {EventRepository, EventInterface} from '../../EventRepository';
import {ClientContactNumberAggregateRecordInterface} from './types';
import {EventStoreModelInterface} from '../../models/EventStore';
import {ClientContactNumberWriteProjectionHandler} from './ClientContactNumberWriteProjectionHandler';

/**
 * Class responsible for interacting with client contact number aggregate data source
 */
export class ClientContactNumberRepository {
  private static readonly AGGREGATE_ID_TYPE = 'client_contact_number';

  constructor(
    private eventRepository: EventRepository,
    private writeProjectionHandler: ClientContactNumberWriteProjectionHandler
  ) {}
  /**
   * Build and returns ClientContactNumberCommandBus
   */
  async getAggregate(clientId: string, sequenceId: number = undefined): Promise<ClientContactNumberAggregate> {
    const projection: ClientContactNumberAggregateRecordInterface = await this.eventRepository.leftFoldEvents(
      this.writeProjectionHandler,
      {client_id: clientId, type: ClientContactNumberRepository.AGGREGATE_ID_TYPE},
      sequenceId
    );

    return new ClientContactNumberAggregate(
      {client_id: clientId, type: ClientContactNumberRepository.AGGREGATE_ID_TYPE},
      projection
    );
  }

  /**
   * Persist client contact number related events into event store
   */
  async save(events: EventInterface[]): Promise<EventStoreModelInterface[]> {
    return this.eventRepository.save(events);
  }
}
