import {TestUtilsZSchemaFormatter} from '../tools/TestUtilsZSchemaFormatter';
import ZSchema from 'z-schema';
import {assert} from 'chai';
import {api} from '../tools/TestUtilsApi';
import {getJWT} from '../tools/TestUtilsJwt';
import _ from 'lodash';
import {ClientContactNumberScenario} from './scenarios/ClientContactNumberScenario';
import {ContactNumberTypeScenario} from './scenarios/ContactNumberTypeScenario';
import {ClientContactNumberProjectionScenarios} from './scenarios/ClientContactNumberProjectionScenarios';

TestUtilsZSchemaFormatter.format();
const validator = new ZSchema({});

describe('/client/{client_id}/contact-number', () => {
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
  const clientId = '619b78e7ff235c9e0cf0b6e1';
  const contactNumberTypeId = 'sample-type-id';
  const clientContactNumberId = '619b78e7ff235c9e0cf0b6e1';
  const contactNumberTypeScenario = new ContactNumberTypeScenario();
  const clientContactNumberScenario = new ClientContactNumberScenario();

  afterEach(async () => {
    await clientContactNumberScenario.deleteAllEvents();
  });

  describe('post', () => {
    it('should respond with 202 : Add Client Contact Number', async () => {
      await contactNumberTypeScenario.createContactNumberType(contactNumberTypeId);
      await clientContactNumberScenario.createClientContactNumber(clientId);
      const res = await api.post(`/client/${clientId}/contact-number`).set(headers).send({
        type_id: 'sample-type-id',
        contact_number: '0911787'
      });

      res.statusCode.should.be.equal(202);

      const location = res.get('Location');

      assert.match(
        location,
        /\/v1\/client\/[0-9a-fA-F]{24}\/contact-number\/[0-9a-fA-F]{24}/g,
        'Expected location to match'
      );
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
                    'PATTERN',
                    'OBJECT_ADDITIONAL_PROPERTIES',
                    'OBJECT_MISSING_REQUIRED_PROPERTY',
                    'CONTACT_NUMBER_TYPE_NOT_FOUND',
                    'CONTACT_NUMBER_TYPE_DISABLED',
                    'CONTACT_NUMBER_ALREADY_EXISTS'
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
      const res = await api.post(`/client/${clientId}/contact-number`).set(headers).send({
        type_id: 'sample-type-id',
        contact_number: 'test'
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
      const res = await api.post(`/client/${clientId}/contact-number`).set(otherHeaders).send({
        type_id: 'sample-type-id',
        contact_number: '0911'
      });

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await ClientContactNumberProjectionScenarios.removeAll();
    });
    it('should respond with 200 List Client Contact Numbers', async () => {
      const schema = {
        type: 'array',
        required: ['_id', 'type_id', 'type_name', 'type_order', 'contact_number', 'updated_at', 'created_at', '__v'],
        properties: {
          _id: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
          },
          type_id: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
          },
          type_name: {
            type: 'string'
          },
          type_order: {
            type: 'integer'
          },
          contact_number: {
            type: 'string'
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

      await ClientContactNumberProjectionScenarios.create({
        _id: clientContactNumberId,
        client_id: clientId
      });
      const res = await api.get(`/client/${clientId}/contact-number`).set(headers).send();

      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['x-result-count'], '1');
      assert.isString(res.headers.link);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
      res.headers['content-type'].should.equal('application/json');
    });

    it('should respond with 204 List Client Contact Numbers', async () => {
      const res = await api.get(`/client/${clientId}/contact-number`).set(headers).send();

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
            enum: ['PATTERN', 'ENUM_MISMATCH', 'INVALID_TYPE', 'REQUIRED', 'MINIMUM']
          },
          message: {
            type: 'string'
          }
        },
        additionalProperties: false
      };
      const res = await api.get('/client/invalid/contact-number').set(headers).send();

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
      const res = await api.get(`/client/${clientId}/contact-number`).set(otherHeaders).send();

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });
});
