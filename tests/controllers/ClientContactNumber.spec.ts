import {assert} from 'chai';
import {ClientContactNumberCommandBus} from '../../src/aggregates/ClientContactNumber/ClientContactNumberCommandBus';
import {
  addClientContactNumber,
  getClientContactNumber,
  listClientContactNumber,
  removeClientContactNumber
} from '../../src/controllers/ClientContactNumber';
import {fakeRequest, fakeResponse} from '../tools/TestUtilsHttp';
import sinon from 'sinon';
import {Types, Error} from 'mongoose';
import {ResourceNotFoundError} from 'a24-node-error-utils';
import {GenericRepository} from '../../src/GenericRepository';
import {QueryHelper} from 'a24-node-query-utils';
import {PaginationHelper} from '../../src/helpers/PaginationHelper';

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

  describe('getClientContactNumber()', () => {
    it('success scenario', async () => {
      const clientId = 'client id';
      const clientContactNumberId = '61c98bde4ed87fdc1b86fb4f';
      const params = {
        client_id: {value: clientId},
        client_contact_number_id: {value: clientContactNumberId}
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');
      const setHeader = sinon.stub(res, 'setHeader');
      const record: any = {
        _id: clientContactNumberId,
        client_id: clientId,
        type_id: '61d53bd04f6745974755ee89',
        type_name: 'mobile',
        type_order: 1,
        contact_number: '+442087599088',
        toJSON: () => record
      };
      const findOne = sinon.stub(GenericRepository.prototype, 'findOne').resolves(record);

      await getClientContactNumber(req, res, next);
      findOne.should.have.been.calledWith({
        _id: clientContactNumberId,
        client_id: clientId
      });
      setHeader.should.have.been.calledWith('Content-Type', 'application/json');
      end.should.have.been.calledWith(JSON.stringify(record));
    });

    it('resource not found scenario', async () => {
      const clientId = 'client id';
      const clientContactNumberId = '61c98bde4ed87fdc1b86fb4f';
      const params = {
        client_id: {value: clientId},
        client_contact_number_id: {value: clientContactNumberId}
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();
      const end = sinon.stub(res, 'end');
      const setHeader = sinon.stub(res, 'setHeader');
      const findOne = sinon.stub(GenericRepository.prototype, 'findOne').resolves();

      await getClientContactNumber(req, res, next);
      findOne.should.have.been.calledWith({
        _id: clientContactNumberId,
        client_id: clientId
      });
      setHeader.should.not.have.been.called;
      end.should.not.have.been.called;
      next.getCall(0).args[0].should.be.instanceOf(ResourceNotFoundError);
    });
  });

  describe('listClientContactNumber()', () => {
    it('success scenario 200', async () => {
      const clientId = '61a5a3ba12d68b2df24d5071';
      const params = {
        client_id: {
          value: clientId
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

      await listClientContactNumber(req, res, next);
      getItemsPerPage.should.have.been.calledWith(params);
      getSkipValue.should.have.been.calledWith(params);
      getSortParams.should.have.been.calledWith(params);
      getQuery.should.have.been.calledWith(params);
      listResources.should.have.been.calledWith(
        {
          ...query,
          client_id: clientId
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
      const clientId = '61a5a3ba12d68b2df24d5071';
      const params = {
        client_id: {
          value: clientId
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
      const sortBy = ['-type_order'];
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

      await listClientContactNumber(req, res, next);
      getItemsPerPage.should.have.been.calledWith(params);
      getSkipValue.should.have.been.calledWith(params);
      getSortParams.should.have.been.calledWith(params);
      getQuery.should.have.been.calledWith(params);
      listResources.should.have.been.calledWith(
        {
          ...query,
          client_id: clientId
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
      const clientId = '61a5a3ba12d68b2df24d5071';
      const params = {
        client_id: {
          value: clientId
        }
      };
      const req = fakeRequest({
        swaggerParams: params
      });
      const res = fakeResponse();
      const next = sinon.spy();

      const limit = 2;
      const skip = 10;
      const sortBy = ['-type_order'];
      const query = {sampleQuery: 'ok'};
      const getItemsPerPage = sinon.stub(QueryHelper, 'getItemsPerPage').returns(limit);
      const getSkipValue = sinon.stub(QueryHelper, 'getSkipValue').returns(skip);
      const getSortParams = sinon.stub(QueryHelper, 'getSortParams').returns(sortBy);
      const getQuery = sinon.stub(QueryHelper, 'getQuery').returns(query);
      const error = new Error('some error');
      const listResources = sinon.stub(GenericRepository.prototype, 'listResources').rejects(error);

      await listClientContactNumber(req, res, next);
      getItemsPerPage.should.have.been.calledWith(params);
      getSkipValue.should.have.been.calledWith(params);
      getSortParams.should.have.been.calledWith(params);
      getQuery.should.have.been.calledWith(params);
      listResources.should.have.been.calledWith(
        {
          ...query,
          client_id: clientId
        },
        limit,
        skip,
        sortBy
      );
      next.should.have.been.calledWith(error);
    });
  });
});
