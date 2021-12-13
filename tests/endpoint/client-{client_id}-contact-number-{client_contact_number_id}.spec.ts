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

describe('/client/{client_id}/contact-number/{client_contact_number_id', () => {
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
  const clientContactNumberId = '61b01b90ec281fb7d43262ae';
  const contactNumberTypeScenario = new ContactNumberTypeScenario();
  const clientContactNumberScenario = new ClientContactNumberScenario();

  afterEach(async () => {
    await clientContactNumberScenario.deleteAllEvents();
  });

  describe('delete', () => {
    it('should respond with 202 : Remove Client Contact Number', async () => {
      await contactNumberTypeScenario.createContactNumberType(contactNumberTypeId);
      await clientContactNumberScenario.createClientContactNumber(clientId);
      const res = await api.delete(`/client/${clientId}/contact-number/${clientContactNumberId}`).set(headers).send({});

      res.statusCode.should.be.equal(202);
    });

    it('should respond with 400 Validation Error', async () => {
      const schema = {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: ['REQUIRED', 'PATTERN']
          },
          message: {
            type: 'string'
          }
        },
        additionalProperties: false
      };
      const res = await api.delete(`/client/${clientId}/contact-number/777`).set(headers).send({});

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
        .delete(`/client/${clientId}/contact-number/${clientContactNumberId}`)
        .set(otherHeaders)
        .send({});

      assert.equal(res.statusCode, 401);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });

    it('should respond with 404', async () => {
      const schema = {
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
      const res = await api.delete(`/client/${clientId}/contact-number/${clientContactNumberId}`).set(headers).send({});

      assert.equal(res.statusCode, 404);
      assert.isTrue(validator.validate(res.body, schema), 'response schema expected to be valid');
    });
  });
});
