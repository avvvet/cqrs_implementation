import {ClientContactNumberCommandDataType} from './ClientContactNumberCommandDataType';

export interface ClientContactNumberCommandHandlerInterface {
  commandType: string;
  execute(clientId: string, commandData: ClientContactNumberCommandDataType): Promise<void>;
}
