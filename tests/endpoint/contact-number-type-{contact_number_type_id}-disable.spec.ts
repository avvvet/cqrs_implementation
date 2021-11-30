import {TestUtilsZSchemaFormatter} from '../tools/TestUtilsZSchemaFormatter';
import ZSchema from 'z-schema';
import {assert} from 'chai';
import {api} from '../tools/TestUtilsApi';
import {getJWT} from '../tools/TestUtilsJwt';
import _ from 'lodash';
import {ContactNumberTypeScenario} from './scenarios/ContactNumberTypeScenario';

TestUtilsZSchemaFormatter.format();
const validator = new ZSchema({});

describe('/contact-number-type/{contact_number_type_id}/disable', () => {
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
  const contactNumberTypeId = '619b78e7ff235c9e0cf0b6e1';
  const contactNumberTypeScenario = new ContactNumberTypeScenario();

  afterEach(async () => {
    await contactNumberTypeScenario.deleteAllEvents();
  });

  describe('post', () => {
    it('should respond with 202 Disable Contact Number Type', async () => {
      await contactNumberTypeScenario.createContactNumberType(contactNumberTypeId);
      const res = await api.post(`/contact-number-type/${contactNumberTypeId}/disable`).set(headers).send({});

      res.statusCode.should.be.equal(202);
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
      const res = await api.post(`/contact-number-type/${contactNumberTypeId}/disable`).set(headers).send({});

      assert.equal(res.statusCode, 404);
      assert.isTrue(validator.validate(res.body, schema), 'response error message expected to be valid');
    });

    it('should response with 400 validation error', async () => {
      const schema = {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['SCHEMA_VALIDATION_FAILED', 'MODEL_VALIDATION_FAILED']
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
                    'OBJECT_ADDITIONAL_PROPERTIES'
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
      const res = await api.post(`/contact-number-type/${contactNumberTypeId}/disable`).set(headers).send({
        description: 'description'
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
      const res = await api
        .post(`/contact-number-type/${contactNumberTypeId}/disable`)
        .set(otherHeaders)
        .send({});

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });
});