import {assert} from 'chai';
import {ContactNumberSettingCommandBus} from '../../src/aggregates/ContactNumberSetting/ContactNumberSettingCommandBus';
import {ContactNumberSettingCommandEnum} from '../../src/aggregates/ContactNumberSetting/types';
import {addContactNumberType} from '../../src/controllers/ContactNumberType';
import {fakeRequest, fakeResponse} from '../tools/TestUtilsHttp';
import sinon from 'sinon';
import {Types} from 'mongoose';

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
});
