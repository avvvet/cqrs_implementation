import {assert} from 'chai';
import {ContactNumberSettingCommandBus} from '../../src/aggregates/ContactNumberSetting/ContactNumberSettingCommandBus';
import {ContactNumberSettingCommandEnum} from '../../src/aggregates/ContactNumberSetting/types';
import {addContactNumberType, updateContactNumberType} from '../../src/controllers/ContactNumberType';
import {fakeRequest, fakeResponse} from '../tools/TestUtilsHttp';
import sinon from 'sinon';
import {Types, Error} from 'mongoose';
import {ValidationError} from 'a24-node-error-utils';

describe('ContactNumberType', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('addContactNumberType()', () => {
    const location = 'http://localhost/contact-number-type';
    const params = {
      add_contact_number_type_payload: {
        value: {
          name: 'sample',
          order: 2
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

      const execute = sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').resolves();

      await addContactNumberType(req, res, next);
      assert.equal(res.statusCode, 202, 'status code expected to be 202');
      assert.deepEqual(setHeader.getCall(0).args, ['Location', `${location}/${recordId}`], 'Expected header to be set');
      assert.equal(end.callCount, 1, 'Expected end to be called');
      assert.equal(next.callCount, 0, 'Expected next to not be called');
      assert.deepEqual(
        execute.getCall(0).args,
        [
          {
            type: ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE,
            data: {
              _id: recordId,
              name: 'sample',
              order: 2
            }
          }
        ],
        'CommandBus.execute expected parameters failed'
      );
    });

    it('failure scenario', async () => {
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      sinon.stub(Types.ObjectId.prototype, 'toString').returns(recordId);
      const error = new Error('custom');
      const execute = sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').rejects(error);

      await addContactNumberType(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
      assert.equal(next.getCall(0).args[0], error, 'Expected error to match');
      assert.deepEqual(
        execute.getCall(0).args,
        [
          {
            type: ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE,
            data: {
              _id: recordId,
              name: 'sample',
              order: 2
            }
          }
        ],
        'CommandBus.execute expected parameters failed'
      );
    });
  });

  describe('updateContactNumberType()', () => {
    const recordId = 'type id';
    const params = {
      contact_number_type_id: {
        value: recordId
      },
      update_contact_number_type_payload: {
        value: {
          name: 'sample',
          order: 2
        }
      }
    };

    it('success scenario', async () => {
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');

      const execute = sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').resolves();

      await updateContactNumberType(req, res, next);
      assert.equal(res.statusCode, 202, 'status code expected to be 202');
      assert.equal(end.callCount, 1, 'Expected end to be called');
      assert.equal(next.callCount, 0, 'Expected next to not be called');
      assert.deepEqual(
        execute.getCall(0).args,
        [
          {
            type: ContactNumberSettingCommandEnum.UPDATE_CONTACT_NUMBER_TYPE,
            data: {
              _id: recordId,
              name: 'sample',
              order: 2
            }
          }
        ],
        'CommandBus.execute expected parameters failed'
      );
    });

    it('validation error scenario when payload is empty', async () => {
      const params = {
        contact_number_type_id: {
          value: recordId
        },
        update_contact_number_type_payload: {
          value: {}
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      const execute = sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute');

      await updateContactNumberType(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
      assert.equal(execute.callCount, 0, 'Expected execute to be not called');
      assert.deepEqual(
        next.getCall(0).args[0],
        new ValidationError('Invalid payload passed', [
          {
            code: 'EMPTY_BODY',
            message: 'empty payload is not allowed',
            path: ['body']
          }
        ]),
        'Expected validation error'
      );
    });

    it('failure scenario', async () => {
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      const error = new Error('custom');
      const execute = sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').rejects(error);

      await updateContactNumberType(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
      assert.equal(next.getCall(0).args[0], error, 'Expected error to match');
      assert.deepEqual(
        execute.getCall(0).args,
        [
          {
            type: ContactNumberSettingCommandEnum.UPDATE_CONTACT_NUMBER_TYPE,
            data: {
              _id: recordId,
              name: 'sample',
              order: 2
            }
          }
        ],
        'CommandBus.execute expected parameters failed'
      );
    });
  });
});
