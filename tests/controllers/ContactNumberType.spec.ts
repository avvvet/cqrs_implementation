import {assert} from 'chai';
import {ContactNumberSettingCommandBus} from '../../src/aggregates/ContactNumberSetting/ContactNumberSettingCommandBus';
import {ContactNumberSettingCommandEnum} from '../../src/aggregates/ContactNumberSetting/types';
import {
  addContactNumberType,
  updateContactNumberType,
  enableContactNumberType,
  disableContactNumberType,
  getContactNumberType,
  listContactNumberType
} from '../../src/controllers/ContactNumberType';
import {fakeRequest, fakeResponse} from '../tools/TestUtilsHttp';
import sinon from 'sinon';
import {Types, Error} from 'mongoose';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';
import {GenericRepository} from '../../src/GenericRepository';
import {QueryHelper} from 'a24-node-query-utils';
import {PaginationHelper} from '../../src/helpers/PaginationHelper';

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

  describe('enableContactNumberType()', () => {
    it('success scenario', async () => {
      const contactNumberTypeId = '619b78e7ff235c9e0cf0b6e1';
      const params = {
        contact_number_type_id: {value: contactNumberTypeId},
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

      sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').resolves();
      await enableContactNumberType(req, res, next);
      assert.equal(res.statusCode, 202, 'status code expected to be 202');
      assert.equal(end.callCount, 1, 'Expected end to be called');
      assert.equal(next.callCount, 0, 'Expected next to not be called');
    });

    it('failure scenario, ResourceNotFoundError', async () => {
      const contactNumberTypeId = '619b78e7ff235c9e0cf0b6e1';
      const params = {
        contact_number_type_id: {value: contactNumberTypeId},
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

      sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').rejects(error);

      await enableContactNumberType(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
    });
  });

  describe('disableContactNumberType()', () => {
    it('success scenario', async () => {
      const contactNumberTypeId = '619b78e7ff235c9e0cf0b6e1';
      const params = {
        contact_number_type_id: {value: contactNumberTypeId},
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

      sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').resolves();
      await disableContactNumberType(req, res, next);
      assert.equal(res.statusCode, 202, 'status code expected to be 202');
      assert.equal(end.callCount, 1, 'Expected end to be called');
      assert.equal(next.callCount, 0, 'Expected next to not be called');
    });

    it('failure scenario, ResourceNotFoundError', async () => {
      const contactNumberTypeId = '619b78e7ff235c9e0cf0b6e1';
      const params = {
        contact_number_type_id: {value: contactNumberTypeId},
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

      sinon.stub(ContactNumberSettingCommandBus.prototype, 'execute').rejects(error);

      await disableContactNumberType(req, res, next);
      assert.equal(next.callCount, 1, 'Expected next to be called');
    });
  });

  describe('getContactNumberType()', () => {
    it('success scenario', async () => {
      const contactNumberTypeId = '61c98bde4ed87fdc1b86fb4f';
      const params = {
        contact_number_type_id: {value: contactNumberTypeId}
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');
      const setHeader = sinon.stub(res, 'setHeader');
      const record: any = {
        _id: contactNumberTypeId,
        name: 'mobile',
        order: 1,
        status: 'enabled',
        toJSON: () => record
      };
      const findOne = sinon.stub(GenericRepository.prototype, 'findOne').resolves(record);

      await getContactNumberType(req, res, next);
      findOne.should.have.been.calledWith({
        _id: contactNumberTypeId
      });
      setHeader.should.have.been.calledWith('Content-Type', 'application/json');
      end.should.have.been.calledWith(JSON.stringify(record));
    });

    it('resource not found scenario', async () => {
      const contactNumberTypeId = 'contact number type id';
      const params = {
        contact_number_type_id: {value: contactNumberTypeId}
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');
      const setHeader = sinon.stub(res, 'setHeader');
      const findOne = sinon.stub(GenericRepository.prototype, 'findOne').resolves();

      await getContactNumberType(req, res, next);
      findOne.should.have.been.calledWith({
        _id: contactNumberTypeId
      });
      setHeader.should.not.have.been.called;
      end.should.not.have.been.called;
      next.getCall(0).args[0].should.be.instanceOf(ResourceNotFoundError);
    });
  });

  describe('listContactNumberType()', () => {
    it('success scenario 200', async () => {
      const params = {
        status: {
          value: 'enabled'
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');

      const limit = 2;
      const skip = 10;
      const sortBy = ['name'];
      const query = {sampleQuery: 'ok'};
      const data = [{sample: 'ok'}];
      const getItemsPerPage = sinon.stub(QueryHelper, 'getItemsPerPage').returns(limit);
      const getSkipValue = sinon.stub(QueryHelper, 'getSkipValue').returns(skip);
      const getSortParams = sinon.stub(QueryHelper, 'getSortParams').returns(sortBy);
      const getQuery = sinon.stub(QueryHelper, 'getQuery').returns(query);
      const listResources = sinon.stub(GenericRepository.prototype, 'listResources').resolves({
        count: 1,
        data
      });
      const setPaginationHeaders = sinon.stub(PaginationHelper, 'setPaginationHeaders').resolves();

      await listContactNumberType(req, res, next);
      getItemsPerPage.should.have.been.calledWith(params);
      getSkipValue.should.have.been.calledWith(params);
      getSortParams.should.have.been.calledWith(params);
      getQuery.should.have.been.calledWith(params);
      listResources.should.have.been.calledWith(
        {
          ...query
        },
        limit,
        skip,
        sortBy
      );
      res.statusCode.should.equal(200);
      setPaginationHeaders.should.have.been.calledWith(req, res, 1);
      end.should.have.been.calledWith(JSON.stringify(data));
      next.should.not.have.been.called;
    });

    it('success scenario 204', async () => {
      const params = {
        status: {
          value: 'enabled'
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');

      const limit = 5;
      const skip = 25;
      const sortBy = ['name'];
      const query = {sampleQuery: 'ok'};
      const data: any[] = [];
      const getItemsPerPage = sinon.stub(QueryHelper, 'getItemsPerPage').returns(limit);
      const getSkipValue = sinon.stub(QueryHelper, 'getSkipValue').returns(skip);
      const getSortParams = sinon.stub(QueryHelper, 'getSortParams').returns(sortBy);
      const getQuery = sinon.stub(QueryHelper, 'getQuery').returns(query);
      const listResources = sinon.stub(GenericRepository.prototype, 'listResources').resolves({
        count: 0,
        data
      });
      const setPaginationHeaders = sinon.stub(PaginationHelper, 'setPaginationHeaders');

      await listContactNumberType(req, res, next);
      getItemsPerPage.should.have.been.calledWith(params);
      getSkipValue.should.have.been.calledWith(params);
      getSortParams.should.have.been.calledWith(params);
      getQuery.should.have.been.calledWith(params);
      listResources.should.have.been.calledWith(
        {
          ...query
        },
        limit,
        skip,
        sortBy
      );
      res.statusCode.should.equal(204);
      setPaginationHeaders.should.not.have.been.called;
      end.should.have.been.calledWith();
      next.should.not.have.been.called;
    });

    it('failure scenario', async () => {
      const params = {
        status: {
          value: 'enabled'
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      const limit = 5;
      const skip = 25;
      const sortBy = ['name'];
      const query = {sampleQuery: 'ok'};
      const getItemsPerPage = sinon.stub(QueryHelper, 'getItemsPerPage').returns(limit);
      const getSkipValue = sinon.stub(QueryHelper, 'getSkipValue').returns(skip);
      const getSortParams = sinon.stub(QueryHelper, 'getSortParams').returns(sortBy);
      const getQuery = sinon.stub(QueryHelper, 'getQuery').returns(query);
      const error = new Error('some error');
      const listResources = sinon.stub(GenericRepository.prototype, 'listResources').rejects(error);

      await listContactNumberType(req, res, next);
      getItemsPerPage.should.have.been.calledWith(params);
      getSkipValue.should.have.been.calledWith(params);
      getSortParams.should.have.been.calledWith(params);
      getQuery.should.have.been.calledWith(params);
      listResources.should.have.been.calledWith(
        {
          ...query
        },
        limit,
        skip,
        sortBy
      );
      next.should.have.been.calledWith(error);
    });
  });
});
