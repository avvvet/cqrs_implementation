import {ServerResponse} from 'http';
import {get, isEmpty} from 'lodash';
import {SwaggerRequestInterface} from 'SwaggerRequestInterface';
import {ContactNumberSettingCommandEnum} from '../aggregates/ContactNumberSetting/types';
import {AddContactNumberTypeCommandInterface} from '../aggregates/ContactNumberSetting/types/CommandTypes';
import {UpdateContactNumberTypeCommandInterface} from '../aggregates/ContactNumberSetting/types/CommandTypes/UpdateContactNumberTypeCommandInterface';
import {EnableContactNumberTypeCommandInterface} from '../aggregates/ContactNumberSetting/types/CommandTypes/EnableContactNumberTypeCommandInterface';
import {ContactNumberSettingCommandBusFactory} from '../factories/ContactNumberSettingCommandBusFactory';
import {Types} from 'mongoose';
import {ValidationError} from 'a24-node-error-utils';

interface AddContactNumberTypePayloadInterface {
  name: string;
  order?: number;
}
interface UpdateContactNumberTypePayloadInterface {
  name?: string;
  order?: number;
}
/**
 * Add Contact Number Type
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - Function used to pass control to the next middleware
 */
export const addContactNumberType = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const swaggerParams = req.swagger.params || {};
    const eventRepository = req.eventRepository;
    const commandBus = ContactNumberSettingCommandBusFactory.getCommandBus(eventRepository);
    const contactNumberTypeId = new Types.ObjectId().toString();
    const payload = get(
      swaggerParams,
      'add_contact_number_type_payload.value',
      {}
    ) as AddContactNumberTypePayloadInterface;

    req.Logger.debug('addContactNumberType request received', {payload});
    const command = {
      type: ContactNumberSettingCommandEnum.ADD_CONTACT_NUMBER_TYPE,
      data: {
        _id: contactNumberTypeId,
        ...payload
      }
    } as AddContactNumberTypeCommandInterface;

    await commandBus.execute(command);
    res.statusCode = 202;
    res.setHeader('Location', `${req.basePathName}/${contactNumberTypeId}`);
    res.end();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      req.Logger.error('Unknown error in add contact number type', error);
    }
    return next(error);
  }
};

/**
 * Update Contact Number Type
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - Function used to pass control to the next middleware
 */
export const updateContactNumberType = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const swaggerParams = req.swagger.params || {};
    const contactNumberTypeId = get(swaggerParams, 'contact_number_type_id.value');
    const eventRepository = req.eventRepository;
    const commandBus = ContactNumberSettingCommandBusFactory.getCommandBus(eventRepository);
    const payload = get(
      swaggerParams,
      'update_contact_number_type_payload.value',
      {}
    ) as UpdateContactNumberTypePayloadInterface;

    req.Logger.debug('updateContactNumberType request received', {payload});
    if (isEmpty(payload)) {
      throw new ValidationError('Invalid payload passed', [
        {
          code: 'EMPTY_BODY',
          message: 'empty payload is not allowed',
          path: ['body']
        }
      ]);
    }

    const command = {
      type: ContactNumberSettingCommandEnum.UPDATE_CONTACT_NUMBER_TYPE,
      data: {
        _id: contactNumberTypeId,
        ...payload
      }
    } as UpdateContactNumberTypeCommandInterface;

    await commandBus.execute(command);
    res.statusCode = 202;
    res.end();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      req.Logger.error('Unknown error in update contact number type', error);
    }
    return next(error);
  }
};

/**
 * Enable Contact Number Type
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - Function used to pass control to the next middleware
 */
 export const enableContactNumberType = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const swaggerParams = req.swagger.params || {};
    const contactNumberTypeId = get(swaggerParams, 'contact_number_type_id.value');
    const eventRepository = req.eventRepository;
    const commandBus = ContactNumberSettingCommandBusFactory.getCommandBus(eventRepository);

    const command = {
      type: ContactNumberSettingCommandEnum.ENABLE_CONTACT_NUMBER_TYPE,
      data: {
        _id: contactNumberTypeId
      }
    } as EnableContactNumberTypeCommandInterface;

    await commandBus.execute(command);
    res.statusCode = 202;
    res.end();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      req.Logger.error('Unknown error in update contact number type', error);
    }
    return next(error);
  }
};
