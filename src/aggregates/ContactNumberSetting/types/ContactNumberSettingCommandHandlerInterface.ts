import {ContactNumberSettingCommandDataType} from './ContactNumberSettingCommandDataType';

export interface ContactNumberSettingCommandHandlerInterface {
  commandType: string;
  execute(commandData: ContactNumberSettingCommandDataType): Promise<void>;
}
