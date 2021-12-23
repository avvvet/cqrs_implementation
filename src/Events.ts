export enum EventsEnum {
  CONTACT_NUMBER_TYPE_ADDED = 'ContactNumberTypeAdded',
  CONTACT_NUMBER_TYPE_UPDATED = 'ContactNumberTypeUpdated',
  CONTACT_NUMBER_TYPE_ENABLED = 'ContactNumberTypeEnabled',
  CONTACT_NUMBER_TYPE_DISABLED = 'ContactNumberTypeDisabled',
  CLIENT_CONTACT_NUMBER_ADDED = 'ClientContactNumberAdded',
  CLIENT_CONTACT_NUMBER_REMOVED = 'ClientContactNumberRemoved'
}

type EventsType = {
  [key in EventsEnum]: {name: string; description: string};
};

export const events: EventsType = {
  [EventsEnum.CONTACT_NUMBER_TYPE_ADDED]: {
    name: 'ContactNumberTypeAdded',
    description: 'The Contact Number Type has been created'
  },
  [EventsEnum.CONTACT_NUMBER_TYPE_UPDATED]: {
    name: 'ContactNumberTypeUpdated',
    description: 'The Contact Number Type has been updated'
  },
  [EventsEnum.CONTACT_NUMBER_TYPE_ENABLED]: {
    name: 'ContactNumberTypeEnabled',
    description: 'The Contact Number Type has been enabled'
  },
  [EventsEnum.CONTACT_NUMBER_TYPE_DISABLED]: {
    name: 'ContactNumberTypeDisabled',
    description: 'The Contact Number Type has been disabled'
  },
  [EventsEnum.CLIENT_CONTACT_NUMBER_ADDED]: {
    name: 'ClientContactNumberAdded',
    description: 'The Client Contact Number has been created'
  },
  [EventsEnum.CLIENT_CONTACT_NUMBER_REMOVED]: {
    name: 'ClientContactNumberRemoved',
    description: 'The Client Contact Number has been removed test'
  }
};
