import sinon from 'sinon';
import {assert} from 'chai';
import {ClientContactNumberProjection} from '../../../../src/models/ClientContactNumberProjection';
import {LoggerContext} from 'a24-logzio-winston';
import {TestUtilsLogger} from '../../../tools/TestUtilsLogger';
import {stubConstructor} from 'ts-sinon';
import {EventRepository} from '../../../../src/EventRepository';
import {PassThrough, TransformOptions} from 'stream';
import {ClientContactNumberProjectionTransformer} from '../../../../src/streaming_applications/ClientContactNumberProjection/transformers/ClientContactNumberProjectionTransformer';
import {Model} from 'mongoose';
import {EventsEnum} from '../../../../src/Events';
import {MONGO_ERROR_CODES} from 'staffshift-node-enums';

interface ProjectionTransformerOptionsInterface extends TransformOptions {
  eventRepository: EventRepository;
  model: Model<any>;
  pipeline: string;
  logger: LoggerContext;
}

describe('ClientContactNumberProjectionTransformer', () => {
  let logger: LoggerContext;
  let opts: ProjectionTransformerOptionsInterface;
  let eventRepository: EventRepository;
  let model: any;
  let clientContactNumberProjectionTransformer: any;

  beforeEach(() => {
    logger = TestUtilsLogger.getLogger(sinon.spy());
    eventRepository = stubConstructor(EventRepository);
    model = ClientContactNumberProjection;
    opts = {
      eventRepository,
      model,
      pipeline: 'client_contact_number_event_store',
      logger: logger
    };
    clientContactNumberProjectionTransformer = new ClientContactNumberProjectionTransformer(opts);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('_transform()', () => {
    it('test unsupported event', (done) => {
      const testData = {
        event: {
          type: 'someRandomEvent'
        }
      };
      const options = {
        objectMode: true,
        highWaterMark: 1,
        version: '3.6.3'
      };
      const inputStream = new PassThrough(options);
      const outputStream = new PassThrough(options);

      inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
      outputStream.on('data', (data) => {
        assert.deepEqual(data, testData, 'Expected output stream was not returned');
      });

      outputStream.on('end', () => {
        done();
      });

      inputStream.write(testData);
      inputStream.resume();

      inputStream.end();
    });

    describe('ClientContactNumberAdded', () => {
      it('test ClientContactNumberAdded event success', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
            aggregate_id: {
              client_id: 'client-id',
              name: 'client_contant_number'
            },
            data: {
              _id: 'some-id',
              type_id: '60126eb559f35a4f3c34ff77',
              contact_number: '091100000000'
            }
          }
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const saveStub = sinon.stub(ClientContactNumberProjection.prototype, 'save');

        saveStub.callsFake((callback) => {
          callback();
        });

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        outputStream.on('data', (data) => {
          assert.deepEqual(data, testData, 'Expected output stream was not returned');
        });

        outputStream.on('end', () => {
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });

      it('test ClientContactNumberAdded event success scenario when save operation fails with duplicate key error ', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
            aggregate_id: {
              client_id: 'client-id',
              name: 'client_contant_number'
            },
            data: {
              _id: '60126eb559f35a4f3c34ff06',
              type_id: '60126eb559f35a4f3c34ff77',
              contact_number: '091100000000'
            }
          }
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const saveStub = sinon.stub(ClientContactNumberProjection.prototype, 'save');

        saveStub.callsFake((callback) => {
          callback({code: MONGO_ERROR_CODES.DUPLICATE_KEY});
        });

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        outputStream.on('data', (data) => {
          assert.deepEqual(data, testData, 'Expected output stream was not returned');
        });

        outputStream.on('end', () => {
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });

      it('test ClientContactNumberAdded event failure', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CLIENT_CONTACT_NUMBER_ADDED,
            aggregate_id: {
              client_id: 'client-id',
              name: 'client_contant_number'
            },
            data: {
              _id: '60126eb559f35a4f3c34ff06',
              type_id: '60126eb559f35a4f3c34ff77',
              contact_number: '091100000000'
            }
          }
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const saveStub = sinon.stub(ClientContactNumberProjection.prototype, 'save');
        const getContactNumberTypeStub = sinon.stub(
          ClientContactNumberProjectionTransformer.prototype,
          <any>'getContactNumberType'
        );

        getContactNumberTypeStub.resolves({type_id: '60126eb559f35a4f3c34ff77', order: 1});
        saveStub.callsFake((callback) => callback(error));

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        clientContactNumberProjectionTransformer.on('error', (err: Error) => {
          assert.deepEqual(err, error, 'Expected error was not returned');
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });
    });

    describe('ClientContactNumberRemoved', () => {
      it('test ClientContactNumberRemoved event success', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED,
            aggregate_id: {
              client_id: 'client-id',
              name: 'client_contant_number'
            },
            data: {
              _id: '60126eb559f35a4f3c34ff06',
              type_id: 'type-id',
              contact_number: '091100000000'
            }
          }
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const filter = {
          _id: '60126eb559f35a4f3c34ff06'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const deleteOneStub = sinon.stub(ClientContactNumberProjection, 'deleteOne');

        deleteOneStub.callsFake((callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          return null;
        });

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        outputStream.on('data', (data) => {
          assert.deepEqual(data, testData, 'Expected output stream was not returned');
        });

        outputStream.on('end', () => {
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });

      it('test ClientContactNumberRemoved event failure', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED,
            aggregate_id: {
              client_id: 'client-id',
              name: 'client_contant_number'
            },
            data: {
              _id: '60126eb559f35a4f3c34ff06',
              type_id: 'type-id',
              contact_number: '091100000000'
            }
          }
        };
        const filter = {
          _id: '60126eb559f35a4f3c34ff06'
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const deleteOneStub = sinon.stub(ClientContactNumberProjection, 'deleteOne');

        deleteOneStub.callsFake(() => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          throw error;
        });

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        clientContactNumberProjectionTransformer.on('error', (err: Error) => {
          assert.deepEqual(err, error, 'Expected error was not returned');
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });
    });

    describe('ContactNumberTypeUpdated', () => {
      it('test ContactNumberTypeUpdated event success', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_UPDATED,
            aggregate_id: {
              name: 'contact_number_setting'
            },
            data: {
              name: 'some name',
              order: 1,
              _id: '60126eb559f35a4f3c34ff06'
            }
          }
        };
        const record = new ClientContactNumberProjection({
          type_name: testData.event.data.name,
          type_order: testData.event.data.order,
          _id: testData.event.data._id
        });
        const updateObject = {
          $inc: {__v: 1},
          $set: {type_name: 'some name', type_order: 1}
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const updateManyStub = sinon.stub(ClientContactNumberProjection, 'updateMany');

        updateManyStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {type_id: '60126eb559f35a4f3c34ff06'}, 'Expected filter does not matched');
          assert.deepEqual(update, updateObject, 'Expected update does not matched');
          assert.deepEqual(options, {}, 'Expected options does not matched');
          callback(null, record, testData);
          return null;
        });

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        outputStream.on('data', (data) => {
          assert.deepEqual(data, testData, 'Expected output stream was not returned');
        });

        outputStream.on('end', () => {
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });

      it('test ContactNumberTypeUpdated event failure', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_UPDATED,
            aggregate_id: {
              name: 'contact_number_setting'
            },
            data: {
              name: 'some name',
              order: 1,
              _id: '60126eb559f35a4f3c34ff06'
            }
          }
        };
        const updateObject = {
          $inc: {__v: 1},
          $set: {type_name: 'some name', type_order: 1}
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const updateManyStub = sinon.stub(ClientContactNumberProjection, 'updateMany');

        updateManyStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {type_id: '60126eb559f35a4f3c34ff06'}, 'Expected filter does not matched');
          assert.deepEqual(update, updateObject, 'Expected update does not matched');
          assert.deepEqual(options, {}, 'Expected options does not matched');
          callback(error);
          return null;
        });

        inputStream.pipe(clientContactNumberProjectionTransformer).pipe(outputStream);
        clientContactNumberProjectionTransformer.on('error', (err: Error) => {
          assert.deepEqual(err, error, 'Expected error was not returned');
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });
    });
  });
});
