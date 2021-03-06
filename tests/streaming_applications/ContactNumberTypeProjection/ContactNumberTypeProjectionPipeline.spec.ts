import sinon from 'sinon';
import {assert} from 'chai';
import {ContactNumberTypeProjectionPipeline} from '../../../src/streaming_applications/ContactNumberTypeProjection/ContactNumberTypeProjectionPipeline';
import {CLIENT_MANAGEMENT_DB_KEY} from '../../../src/streaming_applications/DatabaseConfigKeys';
import {MongoClients} from '../../../src/streaming_applications/core/MongoClients';
import {LoggerContext} from 'a24-logzio-winston';
import {TestUtilsLogger} from '../../tools/TestUtilsLogger';
import {stubConstructor} from 'ts-sinon';
import {ResumeTokenCollectionManager} from '../../../src/streaming_applications/core/ResumeTokenCollectionManager';
import {EventStoreTransformer} from '../../../src/streaming_applications/core/streams/EventStoreTransformer';
import {ContactNumberTypeProjectionTransformer} from '../../../src/streaming_applications/ContactNumberTypeProjection/transformers/ContactNumberTypeProjectionTransformer';
import {STREAM_TYPES_ENUM} from '../../../src/streaming_applications/core/ChangeStreamEnums';

describe('ContactNumberTypeProjectionPipeline', () => {
  let logger: LoggerContext;
  let contactNumberTypeProjectionPipeline: ContactNumberTypeProjectionPipeline;

  beforeEach(() => {
    contactNumberTypeProjectionPipeline = new ContactNumberTypeProjectionPipeline();
    logger = TestUtilsLogger.getLogger(sinon.spy());
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getID()', () => {
    it('should return id', () => {
      const id = contactNumberTypeProjectionPipeline.getID();
      const expectedId = 'contact_number_type_event_store';

      assert.deepEqual(id, expectedId, 'Expected id not returned');
    });
  });

  describe('getMongoClientConfigKeys()', () => {
    it('should return client config keys', () => {
      const keys = contactNumberTypeProjectionPipeline.getMongoClientConfigKeys();
      const expectedKeys = [CLIENT_MANAGEMENT_DB_KEY];

      assert.deepEqual(keys, expectedKeys, 'Expected keys not returned');
    });
  });

  describe('watch() test scenarios', () => {
    const watchStream: any = {
      on: () => this,
      pipe: (component: any) => watchStream
    };
    const dbObject: any = {
      collection: (collection: string) => dbObject,
      watch: (options: any) => watchStream
    };
    const writerStream: any = {
      on: () => this
    };
    const tokenManager = stubConstructor(ResumeTokenCollectionManager);

    tokenManager.getResumeTokenWriterStream.returns(writerStream);

    afterEach(() => {
      sinon.restore();
    });

    it('Assert the pipeline is configured as expected', async () => {
      const pipeSpy = sinon.spy(watchStream, 'pipe');
      const clientManager = stubConstructor(MongoClients);

      clientManager.getClientDatabase.resolves(dbObject);

      await contactNumberTypeProjectionPipeline.watch(logger, clientManager, tokenManager);

      assert.equal(pipeSpy.callCount, 3, 'Expected 3 components to be attached to watch stream');

      // Assert that each step is attached in the correct sequence with the correct object
      const eventStoreTransformerCallArgs = pipeSpy.getCall(0).args;
      const projectionTransformerCallArgs = pipeSpy.getCall(1).args;
      const tokenWriterStreamCallArgs = pipeSpy.getCall(2).args;

      assert.instanceOf(eventStoreTransformerCallArgs[0], EventStoreTransformer);
      assert.instanceOf(projectionTransformerCallArgs[0], ContactNumberTypeProjectionTransformer);
      assert.deepEqual(
        tokenWriterStreamCallArgs[0],
        tokenManager.getResumeTokenWriterStream(contactNumberTypeProjectionPipeline.getID(), STREAM_TYPES_ENUM.WATCH, {
          highWaterMark: 5
        })
      );
    });
  });
});
