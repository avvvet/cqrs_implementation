import {Transform, TransformCallback, TransformOptions} from 'stream';
import {LoggerContext} from 'a24-logzio-winston';
import {CallbackError, FilterQuery, Model} from 'mongoose';
import {EventRepository} from '../../../EventRepository';
import {EventsEnum} from '../../../Events';
import {ContactNumberTypeProjectionDocumentType} from '../../../models/ContactNumberTypeProjection';
import {EventStoreChangeStreamFullDocumentInterface} from '../../../types/EventStoreChangeStreamFullDocumentInterface';
import {MONGO_ERROR_CODES} from 'staffshift-node-enums';
import {MongoError} from 'mongodb';
import {
  ContactNumberTypeAddedEventStoreDataInterface,
  ContactNumberTypeDisabledEventStoreDataInterface,
  ContactNumberTypeEnabledEventStoreDataInterface,
  ContactNumberTypeUpdatedEventStoreDataInterface
} from 'EventStoreDataTypes';

const events = [
  EventsEnum.CONTACT_NUMBER_TYPE_ADDED,
  EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
  EventsEnum.CONTACT_NUMBER_TYPE_DISABLED,
  EventsEnum.CONTACT_NUMBER_TYPE_UPDATED
];

type SupportedEventsDataType =
  | ContactNumberTypeAddedEventStoreDataInterface
  | ContactNumberTypeDisabledEventStoreDataInterface
  | ContactNumberTypeEnabledEventStoreDataInterface
  | ContactNumberTypeUpdatedEventStoreDataInterface;

interface ProjectionTransformerOptionsInterface extends TransformOptions {
  eventRepository: EventRepository;
  model: Model<ContactNumberTypeProjectionDocumentType>;
  pipeline: string;
  logger: LoggerContext;
}

/**
 * Convert an event store entry into the Contact number type Read Projection
 */
export class ContactNumberTypeProjectionTransformer extends Transform {
  private readonly eventRepository: EventRepository;
  private model: Model<ContactNumberTypeProjectionDocumentType>;
  private pipeline: string;
  private logger: LoggerContext;

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
    const criteria: FilterQuery<ContactNumberTypeProjectionDocumentType> = {
      _id: eventData._id
    };

    type UpdateType = {status: string} | ContactNumberTypeUpdatedEventStoreDataInterface;
    switch (data.event.type) {
      case EventsEnum.CONTACT_NUMBER_TYPE_ADDED:
        this.addRecord(this.logger, this.model, data, callback);
        break;
      case EventsEnum.CONTACT_NUMBER_TYPE_ENABLED:
        this.updateRecord<UpdateType>(this.logger, this.model, criteria, {status: 'enabled'}, data, callback);
        break;
      case EventsEnum.CONTACT_NUMBER_TYPE_DISABLED:
        this.updateRecord<UpdateType>(this.logger, this.model, criteria, {status: 'disabled'}, data, callback);
        break;
      case EventsEnum.CONTACT_NUMBER_TYPE_UPDATED:
        this.updateRecord<UpdateType>(
          this.logger,
          this.model,
          criteria,
          event.data as ContactNumberTypeUpdatedEventStoreDataInterface,
          data,
          callback
        );
        break;
      default:
        return callback(new Error(`Unsupported event ${data.event.type} in ContactNumberTypeProjectionTransformer`));
    }
  }

  /**
   * Adds a new record to the projection collection
   *
   * @param logger - logger
   * @param model - The projection model
   * @param data - Data object the transformer received
   * @param callback - the callback
   */
  private addRecord(
    logger: LoggerContext,
    model: Model<ContactNumberTypeProjectionDocumentType>,
    data: EventStoreChangeStreamFullDocumentInterface,
    callback: TransformCallback
  ): void {
    const eventData = data.event.data as ContactNumberTypeAddedEventStoreDataInterface;
    const contactNumberTypeProjection = new model({
      _id: eventData._id,
      name: eventData.name,
      order: eventData.order
    });

    contactNumberTypeProjection.save((err: Error) => {
      if (err) {
        if ((err as MongoError).code === MONGO_ERROR_CODES.DUPLICATE_KEY) {
          this.logger.notice(
            'Duplicate key error for client contact number type record',
            contactNumberTypeProjection.toJSON()
          );
          return callback(null, data);
        }

        logger.error('Error saving a record to the contant number type projection', {
          model: contactNumberTypeProjection.toObject(),
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
   * @param logger - logger
   * @param model - The projection model
   * @param query - query to find record
   * @param updateObject - object to update with
   * @param data - Data object the transformer received
   * @param callback - the callback
   */
  private updateRecord<UpdateType>(
    logger: LoggerContext,
    model: Model<ContactNumberTypeProjectionDocumentType>,
    query: FilterQuery<ContactNumberTypeProjectionDocumentType>,
    updateObject: UpdateType,
    data: EventStoreChangeStreamFullDocumentInterface,
    callback: TransformCallback
  ): void {
    model.updateOne(query, {$set: updateObject}, {}, (err: CallbackError) => {
      if (err) {
        logger.error('Error updating a record to the contact number type projection', {
          originalError: err,
          query,
          updateObject
        });
        return callback(err);
      }
      callback(null, data);
    });
  }
}
