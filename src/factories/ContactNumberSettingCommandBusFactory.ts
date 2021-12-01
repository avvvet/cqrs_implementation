import {
  AddContactNumberTypeCommandHandler,
  UpdateContactNumberTypeCommandHandler,
  EnableContactNumberTypeCommandHandler,
  DisableContactNumberTypeCommandHandler
} from '../aggregates/ContactNumberSetting/command-handlers';
import {
  ContactNumberSettingCommandBus,
  ContactNumberSettingRepository,
  ContactNumberSettingWriteProjectionHandler
} from '../aggregates/ContactNumberSetting';
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

    commandBus
      .addHandler(new AddContactNumberTypeCommandHandler(contactNumberSettingRepository))
      .addHandler(new UpdateContactNumberTypeCommandHandler(contactNumberSettingRepository))
      .addHandler(new EnableContactNumberTypeCommandHandler(contactNumberSettingRepository))
      .addHandler(new DisableContactNumberTypeCommandHandler(contactNumberSettingRepository));
    return commandBus;
  }
}
