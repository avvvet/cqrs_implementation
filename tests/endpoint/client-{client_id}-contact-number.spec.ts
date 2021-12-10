import {TestUtilsZSchemaFormatter} from '../tools/TestUtilsZSchemaFormatter';
import ZSchema from 'z-schema';
import {assert} from 'chai';
import {api} from '../tools/TestUtilsApi';
import {getJWT} from '../tools/TestUtilsJwt';
import _ from 'lodash';
import {ClientContactNumberScenario} from './scenarios/ClientContactNumberScenario';
import {ContactNumberTypeScenario} from './scenarios/ContactNumberTypeScenario';

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
                    'CONTACT_NUMBR_TYPE_NOT_FOUND',
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
});
