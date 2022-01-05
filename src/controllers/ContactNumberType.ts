import {ServerResponse} from 'http';
import {get, isEmpty} from 'lodash';
import {SwaggerRequestInterface} from 'SwaggerRequestInterface';
import {ContactNumberSettingCommandEnum} from '../aggregates/ContactNumberSetting/types';
import {
  AddContactNumberTypeCommandInterface,
  UpdateContactNumberTypeCommandInterface,
  EnableContactNumberTypeCommandInterface,
  DisableContactNumberTypeCommandInterface
} from '../aggregates/ContactNumberSetting/types/CommandTypes';
import {ContactNumberSettingCommandBusFactory} from '../factories/ContactNumberSettingCommandBusFactory';
import {Types} from 'mongoose';
import {QueryHelper} from 'a24-node-query-utils';
import {PaginationHelper} from '../helpers/PaginationHelper';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';
import {
  ContactNumberTypeProjectionDocumentType,
  ContactNumberTypeProjection
} from '../models/ContactNumberTypeProjection';
import {GenericRepository} from '../GenericRepository';

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
    if (!(error instanceof ResourceNotFoundError)) {
      req.Logger.error('Unknown error in enable contact number type', error);
    }
    return next(error);
  }
};

/**
 * Disable Contact Number Type
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - Function used to pass control to the next middleware
 */
export const disableContactNumberType = async (
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
      type: ContactNumberSettingCommandEnum.DISABLE_CONTACT_NUMBER_TYPE,
      data: {
        _id: contactNumberTypeId
      }
    } as DisableContactNumberTypeCommandInterface;

    await commandBus.execute(command);
    res.statusCode = 202;
    res.end();
  } catch (error) {
    if (!(error instanceof ResourceNotFoundError)) {
      req.Logger.error('Unknown error in disable contact number type', error);
    }
    return next(error);
  }
};

/**
 * Get Contact number type
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - The callback used to pass control to the next middleware
 */
export const getContactNumberType = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const swaggerParams = req.swagger.params || {};
    const contactNumberTypeId = get(swaggerParams, 'contact_number_type_id.value');
    const repository = new GenericRepository<ContactNumberTypeProjectionDocumentType>(
      req.Logger,
      ContactNumberTypeProjection
    );
    const record = await repository.findOne({
      _id: contactNumberTypeId
    });

    if (!record) {
      return next(new ResourceNotFoundError('No contact number type found'));
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(record.toJSON()));
  } catch (err) {
    req.Logger.error('getContactNumberType unknown error', {
      err,
      contactNumberTypeId: get(req, 'swagger.params.contact_number_type_id.value')
    });
    next(err);
  }
};

/**
 * List Contact Number Types
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - The next function
 */
export const listContactNumberType = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error: Error) => void
): Promise<void> => {
  try {
    const swaggerParams = req.swagger.params || {};
    const limit = QueryHelper.getItemsPerPage(swaggerParams);
    const skip = QueryHelper.getSkipValue(swaggerParams, limit);
    const sortBy = QueryHelper.getSortParams(swaggerParams);
    const query = QueryHelper.getQuery(swaggerParams);

    const repository = new GenericRepository<ContactNumberTypeProjectionDocumentType>(
      req.Logger,
      ContactNumberTypeProjection
    );
    const {count, data} = await repository.listResources(query, limit, skip, sortBy);

    if (isEmpty(data)) {
      res.statusCode = 204;
      res.end();
    } else {
      PaginationHelper.setPaginationHeaders(req, res, count);
      res.end(JSON.stringify(data));
    }
    req.Logger.info('listContactNumberType completed', {statusCode: res.statusCode});
  } catch (err) {
    req.Logger.error('listContactNumberType unknown error', {err});
    next(err);
  }
};
