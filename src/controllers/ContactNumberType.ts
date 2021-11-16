import {ServerResponse} from 'http';
import {get} from 'lodash';
import {SwaggerRequestInterface} from 'SwaggerRequestInterface';
import {ContactNumberSettingCommandEnum} from '../aggregates/ContactNumberSetting/types';
import {AddContactNumberTypeCommandInterface} from '../aggregates/ContactNumberSetting/types/CommandTypes';
import {ContactNumberSettingCommandBusFactory} from '../factories/ContactNumberSettingCommandBusFactory';
import {Types} from 'mongoose';
import {ValidationError} from 'a24-node-error-utils';

interface AddContactNumberTypePayloadInterface {
  name: string;
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
