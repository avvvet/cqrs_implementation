import {Transform, TransformCallback, TransformOptions} from 'stream';
import {LoggerContext} from 'a24-logzio-winston';
import {CallbackError, FilterQuery, Model} from 'mongoose';
import {EventRepository} from '../../../EventRepository';
import {EventsEnum} from '../../../Events';
import {ClientContactNumberProjectionDocumentType} from '../../../models/ClientContactNumberProjection';
import {EventStoreChangeStreamFullDocumentInterface} from '../../../types/EventStoreChangeStreamFullDocumentInterface';
import {MONGO_ERROR_CODES} from 'staffshift-node-enums';
import {isUndefined} from 'lodash';
import {MongoError} from 'mongodb';
import {
  ClientContactNumberAddedEventStoreDataInterface,
  ClientContactNumberRemovedEventStoreDataInterface,
  ContactNumberTypeUpdatedEventStoreDataInterface
} from 'EventStoreDataTypes';
import {ContactNumberSettingWriteProjectionHandler} from '../../../aggregates/ContactNumberSetting/ContactNumberSettingWriteProjectionHandler';
import {ContactNumberSettingRepository} from '../../../aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberTypeInterface} from '../../../aggregates/ContactNumberSetting/types';

interface UpdateDataInterface {
  type_name?: string;
  type_order?: number;
}
const events = [
  EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
  EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED,
  EventsEnum.CONTACT_NUMBER_TYPE_UPDATED
];

type SupportedEventsDataType =
  | ClientContactNumberAddedEventStoreDataInterface
  | ClientContactNumberRemovedEventStoreDataInterface
  | ContactNumberTypeUpdatedEventStoreDataInterface;

interface ProjectionTransformerOptionsInterface extends TransformOptions {
  eventRepository: EventRepository;
  model: Model<ClientContactNumberProjectionDocumentType>;
  pipeline: string;
  logger: LoggerContext;
}

/**
 * Convert an event store entry into the Client Contact number Read Projection
 */
export class ClientContactNumberProjectionTransformer extends Transform {
  private readonly eventRepository: EventRepository;
  private readonly model: Model<ClientContactNumberProjectionDocumentType>;
  private readonly pipeline: string;
  private readonly logger: LoggerContext;

  constructor(opts: ProjectionTransformerOptionsInterface) {
    // We only cater for object mode
    opts.objectMode = true;
    super(opts);
    this.eventRepository = opts.eventRepository;
    this.model = opts.model;
    this.pipeline = opts.pipeline;
    this.logger = opts.logger;
  }

  _transform(
    data: EventStoreChangeStreamFullDocumentInterface,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    if (!events.includes(data.event.type)) {
      this.logger.debug('Incoming event ignored', {event: data.event.type});

      return callback(null, data);
    }
    this.logger.debug('Processing the incoming event', {event: data.event.type});
    const event = data.event;

    const eventData = event.data as SupportedEventsDataType;
    const criteria: FilterQuery<ClientContactNumberProjectionDocumentType> = {
      _id: eventData._id
    };

    switch (data.event.type) {
      case EventsEnum.CLIENT_CONTACT_NUMBER_ADDED:
        const eventData = data.event.data as ClientContactNumberAddedEventStoreDataInterface;

        this.getContactNumberType(eventData.type_id)
          .then((contactNumberType) => {
            this.addRecord(data, contactNumberType, callback);
          })
          .catch((err) => callback(err));

        break;
      case EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED:
        this.removeRecord(criteria, data, callback);
        break;
      case EventsEnum.CONTACT_NUMBER_TYPE_UPDATED:
        this.updateRecord(criteria, event.data as ContactNumberTypeUpdatedEventStoreDataInterface, data, callback);
        break;
      default:
        return callback(new Error(`Unsupported event ${data.event.type} in ClientContactNumberTransformer`));
    }
  }

  /**
   * Removes an existing record in the projection collection
   *
   * @param query - query to find record
   * @param data - Data object the transformer received
   * @param callback - the callback
   */
  private removeRecord(
    query: FilterQuery<ClientContactNumberProjectionDocumentType>,
    data: EventStoreChangeStreamFullDocumentInterface,
    callback: TransformCallback
  ): void {
    this.model.findOneAndDelete(query, (err: CallbackError) => {
      if (err) {
        this.logger.error('Error removing a record from client contact number projection', {
          originalError: err,
          query
        });
        return callback(err);
      }

      return callback(null, data);
    });
  }

  /**
   * gets an existing contact number type
   *
   * @param contactNumberTypeId - contact number type id
   */
  private async getContactNumberType(contactNumberTypeId: string) {
    const writeProjectionHandler = new ContactNumberSettingWriteProjectionHandler();
    const repository = new ContactNumberSettingRepository(this.eventRepository, writeProjectionHandler);
    const aggregate = await repository.getAggregate();

    return await aggregate.getContactNumberType(contactNumberTypeId);
  }

  /**
   * Adds a new record to the projection collection
   *
   * @param data - Data object the transformer received
   * @param contactNumberType - Associated contact number type
   * @param callback - the callback
   */
  private addRecord(
    data: EventStoreChangeStreamFullDocumentInterface,
    contactNumberType: ContactNumberTypeInterface,
    callback: TransformCallback
  ): void {
    const eventData = data.event.data as ClientContactNumberAddedEventStoreDataInterface;
    const clientContactNumberProjection = new this.model({
      _id: eventData._id,
      type_id: eventData.type_id,
      type_name: contactNumberType.name,
      type_order: contactNumberType.order,
      contact_number: eventData.contact_number,
      client_id: data.event.aggregate_id.client_id
    });

    clientContactNumberProjection.save((err: Error) => {
      if (err) {
        if ((err as MongoError).code === MONGO_ERROR_CODES.DUPLICATE_KEY) {
          this.logger.notice(
            'Duplicate key error for client contact number record',
            clientContactNumberProjection.toJSON()
          );
          return callback(null, data);
        }

        this.logger.error('Error saving a record to the client contact number projection', {
          model: clientContactNumberProjection.toObject(),
          originalError: err
        });
        return callback(err);
      }

      return callback(null, data);
    });
  }

  /**
   * Updates an existing record in the projection collection
   *
   * @param query - query to find record
   * @param updateObject - Update to be applied to the document
   * @param data - Data object the transformer received
   * @param callback - the callback
   */
  private updateRecord(
    query: FilterQuery<ClientContactNumberProjectionDocumentType>,
    updateObject: ContactNumberTypeUpdatedEventStoreDataInterface,
    data: EventStoreChangeStreamFullDocumentInterface,
    callback: TransformCallback
  ): void {
    const updateData: UpdateDataInterface = {};

    if (!isUndefined(updateObject.name)) {
      updateData.type_name = updateObject.name;
    }
    if (!isUndefined(updateObject.order)) {
      updateData.type_order = updateObject.order;
    }

    this.model.updateMany({type_id: updateObject._id}, {$inc: {__v: 1}, $set: updateData}, (err: CallbackError) => {
      if (err) {
        this.logger.error('Error updating records to the client contact number projection', {
          originalError: err,
          query,
          updateObject
        });
        return callback(err);
      }

      return callback(null, data);
    });
  }
}
