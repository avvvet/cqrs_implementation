import {ServerResponse} from 'http';
import {get, isEmpty} from 'lodash';
import {SwaggerRequestInterface} from 'SwaggerRequestInterface';
import {ClientContactNumberCommandEnum, ClientContactNumberInterface} from '../aggregates/ClientContactNumber/types';
import {AddClientContactNumberCommandInterface} from '../aggregates/ClientContactNumber/types/CommandTypes';
import {ClientContactNumberCommandBusFactory} from '../factories/ClientContactNumberCommandBusFactory';
import {Types} from 'mongoose';
import {ValidationError, ResourceNotFoundError} from 'a24-node-error-utils';

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
