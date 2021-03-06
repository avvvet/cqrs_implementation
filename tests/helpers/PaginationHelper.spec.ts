import config from 'config';
import {assert} from 'chai';
import sinon from 'ts-sinon';
import {ExposedServerConfigurationInterface} from '../../src/types/ExposedServerConfigurationInterface';
import {PaginationHelper} from '../../src/helpers/PaginationHelper';
import {TestUtilsLogger} from '../tools/TestUtilsLogger';
import {fakeRequest, fakeResponse} from '../tools/TestUtilsHttp';

describe('PaginationHelper', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('setPaginationHeaders()', () => {
    const page = 1;
    const itemsPerPage = 25;
    const sortBy = ['name'];
    const swaggerParams = {
      page: {
        value: page,
        schema: {
          name: 'page',
          in: 'query'
        }
      },
      items_per_page: {
        value: itemsPerPage,
        schema: {
          name: 'items_per_page',
          in: 'query'
        }
      },
      sortBy: {
        value: sortBy,
        schema: {
          name: 'sortBy',
          in: 'query'
        }
      }
    };

    it('should set the pagination headers on the response object', () => {
      const req = fakeRequest({
        swaggerParams,
        Logger: TestUtilsLogger.getLogger(sinon.spy()),
        basePathName: `/${config.get('exposed_server.version')}/some/path`
      });
      const response = fakeResponse();
      const count = 10;
      const server = config.get<ExposedServerConfigurationInterface>('exposed_server');
      const baseUrl = `${server.protocol}://${server.host}:${server.port}/${server.version}`;
      const expectedHeaders = {
        'content-type': 'application/json',
        'x-result-count': count,
        link:
          `<${baseUrl}/some/path?sortBy=name&page=1&items_per_page=25>; rel="first",` +
          `<${baseUrl}/some/path?sortBy=name&page=1&items_per_page=25>; rel="last"`
      };

      PaginationHelper.setPaginationHeaders(req, response, count);
      assert.deepEqual(response.getHeaders(), expectedHeaders, 'Expected headers does not match');
    });

    it('test that content type is not set when count is 0', () => {
      const req = fakeRequest({
        swaggerParams,
        Logger: TestUtilsLogger.getLogger(sinon.spy()),
        basePathName: `/${config.get('exposed_server.version')}/some/path`
      });
      const response = fakeResponse();
      const count = 0;
      const server = config.get<ExposedServerConfigurationInterface>('exposed_server');
      const baseUrl = `${server.protocol}://${server.host}:${server.port}/${server.version}`;
      const expectedHeaders = {
        'x-result-count': count,
        link:
          `<${baseUrl}/some/path?sortBy=name&page=1&items_per_page=25>; rel="first",` +
          `<${baseUrl}/some/path?sortBy=name&page=1&items_per_page=25>; rel="last"`
      };

      PaginationHelper.setPaginationHeaders(req, response, count);
      assert.deepEqual(response.getHeaders(), expectedHeaders, 'Expected headers does not match');
    });
  });
});
