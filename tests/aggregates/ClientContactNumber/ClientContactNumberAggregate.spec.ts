import {assert} from 'chai';
import sinon, {stubConstructor} from 'ts-sinon';
import {ClientContactNumberAggregate} from '../../../src/aggregates/ClientContactNumber/ClientContactNumberAggregate';
import {ClientContactNumberAggregateIdInterface} from '../../../src/aggregates/ClientContactNumber/types';
import {
  ContactNumberSettingAggregate,
  ContactNumberSettingRepository
} from '../../../src/aggregates/ContactNumberSetting';
import {ValidationError} from 'a24-node-error-utils';

describe('ClientContactNumberAggregate', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('clientContactNumberExists()', () => {
    it('Test Client contact number exists', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);

      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: 'some-name',
              contact_number: '091'
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      assert.isTrue(aggregate.clientContactNumberExists('091', 'some-name'), 'Expected client contact number exists');
    });

    it('Test Client contact number not exists', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: 'some-name',
              contact_number: '09111111'
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      assert.isNotTrue(
        aggregate.clientContactNumberExists('09111111', 'diffrent-type'),
        'Expected client contact number not exists'
      );
    });
  });

  describe('clientContactNumberIdExists()', () => {
    it('Test Client contact number id exists', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: 'some-name',
              contact_number: '091'
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      assert.isTrue(
        aggregate.clientContactNumberIdExists('61948046abd55b1a8ec55671'),
        'Expected client contact number id exists'
      );
    });

    it('Test Client contact number id not found', () => {
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      } as ClientContactNumberAggregateIdInterface;
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: 'some-name',
              contact_number: '09111111'
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      assert.isNotTrue(
        aggregate.clientContactNumberIdExists('77748046abd55b1a8ec55777'),
        'Expected client contact number id not found'
      );
    });
  });

  describe('validateAddClientContactNumberInvariants()', () => {
    it('test that validation error is thrown when contact number type does not exist', async () => {
      const contactNumber = '09111111';
      const contactTypeId = 'some id';
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      };
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const contactNumberSettingAggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingAggregate.contactNumberTypeExists.returns(false);
      contactNumberSettingRepository.getAggregate.resolves(contactNumberSettingAggregate);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: contactTypeId,
              contact_number: contactNumber
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      await aggregate
        .validateAddClientContactNumberInvariants(contactTypeId, contactNumber)
        .should.be.rejectedWith(ValidationError, 'Not allowed. Contact number type does not exist');

      contactNumberSettingAggregate.contactNumberTypeExists.should.have.been.calledOnceWith(contactTypeId);
      contactNumberSettingRepository.getAggregate.should.have.been.called;
    });

    it('test that validation error is thrown when contact number type is not enabled', async () => {
      const contactNumber = '09111111';
      const contactTypeId = 'some id';
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      };
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const contactNumberSettingAggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingAggregate.contactNumberTypeExists.returns(true);
      contactNumberSettingAggregate.contactNumberTypeEnabled.returns(false);
      contactNumberSettingRepository.getAggregate.resolves(contactNumberSettingAggregate);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: contactTypeId,
              contact_number: contactNumber
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      await aggregate
        .validateAddClientContactNumberInvariants(contactTypeId, contactNumber)
        .should.be.rejectedWith(ValidationError, 'Not allowed. Contact number type is disabled');

      contactNumberSettingAggregate.contactNumberTypeExists.should.have.been.calledOnceWith(contactTypeId);
      contactNumberSettingRepository.getAggregate.should.have.been.called;
    });

    it('test that validation error is thrown when client contact number client already exists', async () => {
      const contactNumber = '09111111';
      const contactTypeId = 'some id';
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      };
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const contactNumberSettingAggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingAggregate.contactNumberTypeExists.returns(true);
      contactNumberSettingAggregate.contactNumberTypeEnabled.returns(true);
      contactNumberSettingRepository.getAggregate.resolves(contactNumberSettingAggregate);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [
            {
              _id: '61948046abd55b1a8ec55671',
              type_id: contactTypeId,
              contact_number: contactNumber
            }
          ],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      await aggregate
        .validateAddClientContactNumberInvariants(contactTypeId, contactNumber)
        .should.be.rejectedWith(ValidationError, 'Not allowed. Client Contact number already exists');

      contactNumberSettingAggregate.contactNumberTypeExists.should.have.been.calledOnceWith(contactTypeId);
      contactNumberSettingRepository.getAggregate.should.have.been.called;
    });

    it('test that promise resolve successfully when all invariants check are valid', async () => {
      const contactNumber = '09111111';
      const contactTypeId = 'some id';
      const aggregateId = {
        client_id: 'client-id',
        name: 'client_contact_number'
      };
      const contactNumberSettingRepository = stubConstructor(ContactNumberSettingRepository);
      const contactNumberSettingAggregate = stubConstructor(ContactNumberSettingAggregate);

      contactNumberSettingAggregate.contactNumberTypeExists.returns(true);
      contactNumberSettingAggregate.contactNumberTypeEnabled.returns(true);
      contactNumberSettingRepository.getAggregate.resolves(contactNumberSettingAggregate);
      const aggregate = new ClientContactNumberAggregate(
        aggregateId,
        {
          contact_numbers: [],
          last_sequence_id: 0
        },
        contactNumberSettingRepository
      );

      await aggregate.validateAddClientContactNumberInvariants(contactTypeId, contactNumber).should.be.fulfilled;
      contactNumberSettingAggregate.contactNumberTypeExists.should.have.been.calledOnceWith(contactTypeId);
      contactNumberSettingRepository.getAggregate.should.have.been.called;
    });
  });
});
