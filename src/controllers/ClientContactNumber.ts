import {ServerResponse} from 'http';
import {get, isEmpty} from 'lodash';
import {SwaggerRequestInterface} from 'SwaggerRequestInterface';
import {ClientContactNumberCommandEnum, ClientContactNumberInterface} from '../aggregates/ClientContactNumber/types';
import {
  AddClientContactNumberCommandInterface,
  RemoveClientContactNumberCommandInterface
} from '../aggregates/ClientContactNumber/types/CommandTypes';
import {ClientContactNumberCommandBusFactory} from '../factories/ClientContactNumberCommandBusFactory';
import {Types} from 'mongoose';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';
import {QueryHelper} from 'a24-node-query-utils';
import {PaginationHelper} from '../helpers/PaginationHelper';
import {
  ClientContactNumberProjectionDocumentType,
  ClientContactNumberProjection
} from '../models/ClientContactNumberProjection';
import {GenericRepository} from '../GenericRepository';

/**
 * Add Contact Number
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - Function used to pass control to the next middleware
 */
export const addClientContactNumber = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const payload = get(
      req,
      'swagger.params.add_client_contact_number_payload.value',
      {}
    ) as ClientContactNumberInterface;
    const clientId = get(req, 'swagger.params.client_id.value', '');
    const eventRepository = req.eventRepository;
    const commandBus = ClientContactNumberCommandBusFactory.getCommandBus(eventRepository);
    const clientContactNumberId = new Types.ObjectId().toString();

    req.Logger.debug('addClientContactNumber request received', {payload});
    const command = {
      type: ClientContactNumberCommandEnum.ADD_CLIENT_CONTACT_NUMBER,
      data: {
        _id: clientContactNumberId,
        ...payload
      }
    } as AddClientContactNumberCommandInterface;

    await commandBus.execute(clientId, command);
    res.statusCode = 202;
    res.setHeader('Location', `${req.basePathName}/${clientContactNumberId}`);
    res.end();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      req.Logger.error('Unknown error in add client contact number', error);
    }
    return next(error);
  }
};

/**
 * Remove Client Contact Number
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - Function used to pass control to the next middleware
 */
export const removeClientContactNumber = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const clientId = get(req, 'swagger.params.client_id.value', '');
    const clientContactNumberId = get(req, 'swagger.params.client_contact_number_id.value', '');
    const eventRepository = req.eventRepository;
    const commandBus = ClientContactNumberCommandBusFactory.getCommandBus(eventRepository);

    req.Logger.debug(
      `removeClientContactNumber request received', client id : ${clientId} contact number id : ${clientContactNumberId}`
    );
    const command = {
      type: ClientContactNumberCommandEnum.REMOVE_CLIENT_CONTACT_NUMBER,
      data: {
        _id: clientContactNumberId
      }
    } as RemoveClientContactNumberCommandInterface;

    await commandBus.execute(clientId, command);
    res.statusCode = 202;
    res.end();
  } catch (error) {
    if (!(error instanceof ResourceNotFoundError)) {
      req.Logger.error('Unknown error in remove client contact number', error);
    }
    return next(error);
  }
};

/**
 * Get Client Contact number
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - The callback used to pass control to the next middleware
 */
export const getClientContactNumber = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error?: Error) => void
): Promise<void> => {
  try {
    const swaggerParams = req.swagger.params || {};
    const clientId = get(req, 'swagger.params.client_id.value', '');
    const clientContactNumberId = get(swaggerParams, 'client_contact_number_id.value');
    const repository = new GenericRepository<ClientContactNumberProjectionDocumentType>(
      req.Logger,
      ClientContactNumberProjection
    );
    const record = await repository.findOne({
      _id: clientContactNumberId,
      client_id: clientId
    });

    if (!record) {
      return next(new ResourceNotFoundError('Client contact number not found'));
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(record.toJSON()));
  } catch (err) {
    req.Logger.error('getClientContactNumber unknown error', {
      err,
      contactNumberTypeId: get(req, 'swagger.params.client_contact_number_id.value')
    });
    next(err);
  }
};

/**
 * List Client Contact Numbers
 *
 * @param req - The http request object
 * @param res - The http response object
 * @param next - The next function
 */
export const listClientContactNumber = async (
  req: SwaggerRequestInterface,
  res: ServerResponse,
  next: (error: Error) => void
): Promise<void> => {
  try {
    const clientId = get(req, 'swagger.params.client_id.value', '');
    const swaggerParams = req.swagger.params || {};
    const limit = QueryHelper.getItemsPerPage(swaggerParams);
    const skip = QueryHelper.getSkipValue(swaggerParams, limit);
    const sortBy = QueryHelper.getSortParams(swaggerParams);
    const query = QueryHelper.getQuery(swaggerParams);

    query.client_id = clientId;
    const repository = new GenericRepository<ClientContactNumberProjectionDocumentType>(
      req.Logger,
      ClientContactNumberProjection
    );
    const {count, data} = await repository.listResources(query, limit, skip, sortBy);

    if (isEmpty(data)) {
      res.statusCode = 204;
      res.end();
    } else {
      PaginationHelper.setPaginationHeaders(req, res, count);
      res.end(JSON.stringify(data));
    }
    req.Logger.info('listClientContactNumber completed', {statusCode: res.statusCode});
  } catch (err) {
    req.Logger.error('listClientContactNumber unknown error', {err});
    next(err);
  }
};
