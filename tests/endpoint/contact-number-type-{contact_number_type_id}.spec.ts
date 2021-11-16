import {TestUtilsZSchemaFormatter} from '../tools/TestUtilsZSchemaFormatter';
import ZSchema from 'z-schema';
import {assert} from 'chai';
import {api} from '../tools/TestUtilsApi';
import {getJWT} from '../tools/TestUtilsJwt';
import _ from 'lodash';
import {ContactNumberTypeScenario} from './scenarios/ContactNumberTypeScenario';

TestUtilsZSchemaFormatter.format();
const validator = new ZSchema({});

describe('/contact-number-type/{contact_number_type_id}', () => {
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
    await scenario.createContactNumberType(contactNumberTypeId);
  });

  describe('patch', () => {
    it('should respond with 202 Creates a contact number type', async () => {
      const res = await api.patch(`/contact-number-type/${contactNumberTypeId}`).set(headers).send({
        name: 'sample',
        order: 2
      });

      res.statusCode.should.equal(202);
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
                    'DUPLICATE_NAME',
                    'MIN_LENGTH',
                    'MAX_LENGTH',
                    'EMPTY_BODY'
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
      const res = await api.patch(`/contact-number-type/${contactNumberTypeId}`).set(headers).send({
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
      const res = await api.patch(`/contact-number-type/${contactNumberTypeId}`).set(otherHeaders).send({
        name: 'sample'
      });

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });

    it('should respond with 404 resource not found', async () => {
      const schema = {
        description: 'No resource found',
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['RESOURCE_NOT_FOUND']
          },
          message: {
            type: 'string'
          }
        },
        additionalProperties: false
      };
      const res = await api.patch('/contact-number-type/6193a9e483504923fa000001').set(headers).send({
        name: 'sample',
        order: 1
      });

      assert.equal(res.statusCode, 404);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });
});
