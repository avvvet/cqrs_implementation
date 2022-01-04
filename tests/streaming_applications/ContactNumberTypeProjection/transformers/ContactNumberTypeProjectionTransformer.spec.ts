import sinon from 'sinon';
import {assert} from 'chai';
import {ContactNumberTypeProjection} from '../../../../src/models/ContactNumberTypeProjection';
import {LoggerContext} from 'a24-logzio-winston';
import {TestUtilsLogger} from '../../../tools/TestUtilsLogger';
import {stubConstructor} from 'ts-sinon';
import {EventRepository} from '../../../../src/EventRepository';
import {PassThrough, TransformOptions} from 'stream';
import {ContactNumberTypeProjectionTransformer} from '../../../../src/streaming_applications/ContactNumberTypeProjection/transformers/ContactNumberTypeProjectionTransformer';
import {Model} from 'mongoose';
import {EventsEnum} from '../../../../src/Events';
import {MONGO_ERROR_CODES} from 'staffshift-node-enums';

interface ProjectionTransformerOptionsInterface extends TransformOptions {
  eventRepository: EventRepository;
  model: Model<any>;
  pipeline: string;
  logger: LoggerContext;
}

describe('ContactNumberTypeProjectionTransformer', () => {
  let logger: LoggerContext;
  let opts: ProjectionTransformerOptionsInterface;
  let eventRepository: EventRepository;
  let model: any;
  let contactNumberTypeProjectionTransformer: any;

  beforeEach(() => {
    logger = TestUtilsLogger.getLogger(sinon.spy());
    eventRepository = stubConstructor(EventRepository);
    model = ContactNumberTypeProjection;
    opts = {
      eventRepository,
      model,
      pipeline: 'contact_number_type_event_store',
      logger: logger
    };
    contactNumberTypeProjectionTransformer = new ContactNumberTypeProjectionTransformer(opts);
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

      inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
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

    describe('ContactNumberTypeAdded', () => {
      it('test ContactNumberTypeAdded event success', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_ADDED,
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
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const saveStub = sinon.stub(ContactNumberTypeProjection.prototype, 'save');

        saveStub.callsFake((callback) => {
          callback();
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
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

      it('test ContactNumberTypeAdded event success scenario when save operation fails with duplicate key error ', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_ADDED,
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
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const saveStub = sinon.stub(ContactNumberTypeProjection.prototype, 'save');

        saveStub.callsFake((callback: any) => {
          callback({code: MONGO_ERROR_CODES.DUPLICATE_KEY});
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
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

      it('test ContactNumberTypeAdded event failure', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_ADDED,
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
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const saveStub = sinon.stub(ContactNumberTypeProjection.prototype, 'save');

        saveStub.callsFake((callback) => {
          callback(error);
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
        contactNumberTypeProjectionTransformer.on('error', (err: Error) => {
          assert.deepEqual(err, error, 'Expected error was not returned');
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });
    });

    describe('ContactNumberEnabled', () => {
      it('test ContactNumberEnabled event success', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
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
        const record = new ContactNumberTypeProjection({
          name: testData.event.data.name,
          order: testData.event.data.order,
          _id: testData.event.data._id
        });
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const updateOneStub = sinon.stub(ContactNumberTypeProjection, 'updateOne');

        updateOneStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          assert.deepEqual(update, {$inc: {__v: 1}, $set: {status: 'enabled'}}, 'Expected record does not matched');
          assert.deepEqual(options, {}, 'Expected record does not matched');
          callback(null, record, testData);
          return null;
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
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

      it('test ContactNumberTypeEnabled event failure', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_ENABLED,
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
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const updateOneStub = sinon.stub(ContactNumberTypeProjection, 'updateOne');

        updateOneStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          assert.deepEqual(update, {$inc: {__v: 1}, $set: {status: 'enabled'}}, 'Expected record does not matched');
          assert.deepEqual(options, {}, 'Expected record does not matched');
          callback(error);
          return null;
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
        contactNumberTypeProjectionTransformer.on('error', (err: Error) => {
          assert.deepEqual(err, error, 'Expected error was not returned');
          done();
        });

        inputStream.write(testData);
        inputStream.resume();

        inputStream.end();
      });
    });

    describe('ContactNumberDisabled', () => {
      it('test ContactNumberDisabled event success', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_DISABLED,
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
        const record = new ContactNumberTypeProjection({
          name: testData.event.data.name,
          order: testData.event.data.order,
          _id: testData.event.data._id
        });
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const updateOneStub = sinon.stub(ContactNumberTypeProjection, 'updateOne');

        updateOneStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          assert.deepEqual(update, {$inc: {__v: 1}, $set: {status: 'disabled'}}, 'Expected record does not matched');
          assert.deepEqual(options, {}, 'Expected record does not matched');
          callback(null, record, testData);
          return null;
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
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

      it('test ContactNumberTypeDisabled event failure', (done) => {
        const testData = {
          event: {
            type: EventsEnum.CONTACT_NUMBER_TYPE_DISABLED,
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
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const updateOneStub = sinon.stub(ContactNumberTypeProjection, 'updateOne');

        updateOneStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          assert.deepEqual(update, {$inc: {__v: 1}, $set: {status: 'disabled'}}, 'Expected record does not matched');
          assert.deepEqual(options, {}, 'Expected record does not matched');
          callback(error);
          return null;
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
        contactNumberTypeProjectionTransformer.on('error', (err: Error) => {
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
        const record = new ContactNumberTypeProjection({
          name: testData.event.data.name,
          order: testData.event.data.order,
          _id: testData.event.data._id
        });
        const updateObject = {
          $inc: {__v: 1},
          $set: testData.event.data
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const updateOneStub = sinon.stub(ContactNumberTypeProjection, 'updateOne');

        updateOneStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          assert.deepEqual(update, updateObject, 'Expected record does not matched');
          assert.deepEqual(options, {}, 'Expected record does not matched');
          callback(null, record, testData);
          return null;
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
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
          $set: testData.event.data
        };
        const options = {
          objectMode: true,
          highWaterMark: 1,
          version: '3.6.3'
        };
        const inputStream = new PassThrough(options);
        const outputStream = new PassThrough(options);

        const error = new Error('my error');
        const updateOneStub = sinon.stub(ContactNumberTypeProjection, 'updateOne');

        updateOneStub.callsFake((filter: any, update: any, options: any, callback: any): any => {
          assert.deepEqual(filter, {_id: '60126eb559f35a4f3c34ff06'}, 'Expected query does not matched');
          assert.deepEqual(update, updateObject, 'Expected record does not matched');
          assert.deepEqual(options, {}, 'Expected record does not matched');
          callback(error);
          return null;
        });

        inputStream.pipe(contactNumberTypeProjectionTransformer).pipe(outputStream);
        contactNumberTypeProjectionTransformer.on('error', (err: Error) => {
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
