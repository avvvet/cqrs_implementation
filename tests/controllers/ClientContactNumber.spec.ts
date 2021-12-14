import {assert} from 'chai';
import {ClientContactNumberCommandBus} from '../../src/aggregates/ClientContactNumber/ClientContactNumberCommandBus';
import {ClientContactNumberCommandEnum} from '../../src/aggregates/ClientContactNumber/types';
import {addClientContactNumber, removeClientContactNumber} from '../../src/controllers/ClientContactNumber';
import {fakeRequest, fakeResponse} from '../tools/TestUtilsHttp';
import sinon from 'sinon';
import {Types, Error} from 'mongoose';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';
import {AddClientContactNumberCommandInterface} from '../../src/aggregates/ClientContactNumber/types/CommandTypes';

describe('ContactNumberType', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('addClientContactNumber()', () => {
    const location = 'http://localhost/client/client-id/contact-number';
    const clientId = '619b78e7ff235c9e0cf0b6e1';
    const params = {
      add_client_contact_number_payload: {
        value: {
          type_id: 'sample-type-id',
          client_id: clientId,
          contact_number: '0911'
        }
      }
    };
    const recordId = 'type id';

    it('success scenario', async () => {
      const req = fakeRequest({
        swaggerParams: params,
        basePathName: location
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const setHeader = sinon.stub(res, 'setHeader');
      const end = sinon.stub(res, 'end');

      sinon.stub(Types.ObjectId.prototype, 'toString').returns(recordId);

      sinon.stub(ClientContactNumberCommandBus.prototype, 'execute').resolves();

      await addClientContactNumber(req, res, next);
      assert.equal(res.statusCode, 202, 'status code expected to be 202');
      assert.deepEqual(setHeader.getCall(0).args, ['Location', `${location}/${recordId}`], 'Expected header to be set');
      assert.equal(end.callCount, 1, 'Expected end to be called');
      assert.equal(next.callCount, 0, 'Expected next to not be called');
    });

    it('failure scenario, ResourceNotFoundError', async () => {
      const params = {
        add_client_contact_number_payload: {
          value: {
            type_id: 'sample-type-id',
            client_id: clientId,
            contact_number: '0911'
          }
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      const error = new ResourceNotFoundError('sample');

      sinon.stub(ClientContactNumberCommandBus.prototype, 'execute').rejects(error);

      await addClientContactNumber(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
    });
  });

  describe('removeClientContactNumber()', () => {
    it('success scenario', async () => {
      const clientId = '619b78e7ff235c9e0cf0b6e1';
      const clientContactNumberId = '61b01b90ec281fb7d43262ae';
      const params = {
        client__id: {value: clientId},
        client_contact_number_id: {value: clientContactNumberId},
        payload: {
          value: {}
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');

      sinon.stub(ClientContactNumberCommandBus.prototype, 'execute').resolves();
      await removeClientContactNumber(req, res, next);
      assert.equal(res.statusCode, 202, 'status code expected to be 202');
      assert.equal(end.callCount, 1, 'Expected end to be called');
      assert.equal(next.callCount, 0, 'Expected next to not be called');
    });

    it('failure scenario, ResourceNotFoundError', async () => {
      const clientId = '619b78e7ff235c9e0cf0b6e1';
      const clientContactNumberId = '61b01b90ec281fb7d43262ae';
      const params = {
        client__id: {value: clientId},
        client_contact_number_id: {value: clientContactNumberId},
        payload: {
          value: {}
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      const error = new ResourceNotFoundError('sample');

      sinon.stub(ClientContactNumberCommandBus.prototype, 'execute').rejects(error);

      await removeClientContactNumber(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
      assert.instanceOf(
        next.getCall(0).args[0],
        ResourceNotFoundError,
        'Expected error to be instance of ResourceNotFoundError'
      );
    });
  });
});
