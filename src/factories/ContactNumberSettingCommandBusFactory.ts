import {AddContactNumberTypeCommandHandler} from '../aggregates/ContactNumberSetting/command-handlers/AddContactNumberTypeCommandHandler';
import {ContactNumberSettingCommandBus} from '../aggregates/ContactNumberSetting/ContactNumberSettingCommandBus';
import {ContactNumberSettingRepository} from '../aggregates/ContactNumberSetting/ContactNumberSettingRepository';
import {ContactNumberSettingWriteProjectionHandler} from '../aggregates/ContactNumberSetting/ContactNumberSettingWriteProjectionHandler';
import {EventRepository} from '../EventRepository';

/**
 * Factory class responsible for building an Contact Number Setting configured with supported command handlers
 */
export class ContactNumberSettingCommandBusFactory {
  /**
   * Returns an instance of ContactNumberSettingCommandBus with a list of supported command handlers configured
   */
  static getCommandBus(eventRepository: EventRepository): ContactNumberSettingCommandBus {
    const contactNumberSettingRepository = new ContactNumberSettingRepository(
      eventRepository,
      new ContactNumberSettingWriteProjectionHandler()
    );
    const commandBus = new ContactNumberSettingCommandBus();

    commandBus.addHandler(new AddContactNumberTypeCommandHandler(contactNumberSettingRepository));
    return commandBus;
  }
}
