import {TestUtilsZSchemaFormatter} from '../tools/TestUtilsZSchemaFormatter';
import ZSchema from 'z-schema';
import {assert} from 'chai';
import {api} from '../tools/TestUtilsApi';
import {getJWT} from '../tools/TestUtilsJwt';
import _ from 'lodash';
import {ContactNumberTypeScenario} from './scenarios/ContactNumberTypeScenario';
import {ContactNumberTypeProjectionScenarios} from './scenarios/ContactNumberTypeProjectionScenarios';

TestUtilsZSchemaFormatter.format();
const validator = new ZSchema({});

describe('/contact-number-type', () => {
  const jwtToken = getJWT({
    sub: '5ff6e098fb83732f8e23dc92',
    name: 'John Doe',
    iat: 1516239022
  });
  const headers = {
    'x-request-jwt': jwtToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Request-Id': '123'
  };
  const contactNumberTypeId = '6193a668de89ae5ab5000001';

  beforeEach(async () => {
    const scenario = new ContactNumberTypeScenario();

    await scenario.deleteAllEvents();
  });

  describe('post', () => {
    it('should respond with 202 Creates a contact number type', async () => {
      const res = await api.post('/contact-number-type').set(headers).send({
        name: 'sample',
        order: 2
      });

      res.statusCode.should.equal(202);
      const location = res.get('Location');

      assert.match(location, /\/v1\/contact-number-type\/[0-9a-fA-F]{24}/g, 'Expected location to match');
    });

    it('should respond with 400 Validation Error', async () => {
      const schema = {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['REQUIRED', 'MODEL_VALIDATION_FAILED', 'SCHEMA_VALIDATION_FAILED']
          },
          message: {
            type: 'string'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              required: ['code', 'message', 'path'],
              properties: {
                code: {
                  type: 'string',
                  enum: [
                    'INVALID_TYPE',
                    'OBJECT_ADDITIONAL_PROPERTIES',
                    'OBJECT_MISSING_REQUIRED_PROPERTY',
                    'DUPLICATE_NAME',
                    'MAX_LENGTH',
                    'MIN_LENGTH'
                  ]
                },
                message: {
                  type: 'string'
                },
                path: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                description: {
                  type: 'string'
                }
              },
              additionalProperties: false
            }
          }
        },
        additionalProperties: false
      };
      const res = await api.post('/contact-number-type').set(headers).send({
        name: 'sample',
        order: 'oops'
      });

      assert.equal(res.statusCode, 400);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });

    it('should respond with 401 Failed to authenticate', async () => {
      const schema = {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['UNAUTHORIZED']
          },
          message: {
            type: 'string'
          }
        },
        additionalProperties: false
      };
      const otherHeaders = _.cloneDeep(headers);

      otherHeaders['x-request-jwt'] = 'invalid';
      const res = await api.post('/contact-number-type').set(otherHeaders).send({
        name: 'sample'
      });

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await ContactNumberTypeProjectionScenarios.removeAll();
    });
    it('should respond with 200 List Contact Number Types', async () => {
      const schema = {
        type: 'array',
        required: ['_id', 'name', 'order', 'status', 'updated_at', 'created_at', '__v'],
        properties: {
          _id: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
          },
          name: {
            type: 'string'
          },
          order: {
            type: 'integer'
          },
          status: {
            type: 'string',
            enum: ['enabled', 'disabled']
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          __v: {
            type: 'integer'
          }
        },
        additionalProperties: false
      };

      await ContactNumberTypeProjectionScenarios.create({
        _id: contactNumberTypeId
      });
      const res = await api.get('/contact-number-type').set(headers).send();

      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['x-result-count'], '1');
      assert.isString(res.headers.link);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
      res.headers['content-type'].should.equal('application/json');
    });

    it('should respond with 204 List Contact Number Types', async () => {
      const res = await api.get('/contact-number-type').set(headers).send();

      assert.equal(res.statusCode, 204);
      assert.isUndefined(res.headers['x-result-count']);
      assert.isUndefined(res.headers.link);
      assert.isEmpty(res.body);
      assert.isUndefined(res.headers['Content-Type']);
    });

    it('should response with 400 validation error', async () => {
      const schema = {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['PATTERN', 'ENUM_MISMATCH', 'INVALID_TYPE', 'REQUIRED']
          },
          message: {
            type: 'string'
          }
        },
        additionalProperties: false
      };
      const res = await api.get('/contact-number-type?status=invalid').set(headers).send();

      assert.equal(res.statusCode, 400);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });

    it('should response with 401 authorization failure', async () => {
      const schema = {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['UNAUTHORIZED']
          },
          message: {
            type: 'string'
          }
        },
        additionalProperties: false
      };
      const otherHeaders = _.cloneDeep(headers);

      otherHeaders['x-request-jwt'] = 'invalid';
      const res = await api.get('/contact-number-type').set(otherHeaders).send();

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });
});
