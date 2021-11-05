export enum EventsEnum {
  CONTACT_NUMBER_TYPE_ADDED = 'ContactNumberTypeAdded',
  CLIENT_CONTACT_NUMBER_ADDED = 'ClientContactNumberAdded'
}

type EventsType = {
  [key in EventsEnum]: {name: string; description: string};
};

export const events: EventsType = {
  [EventsEnum.CONTACT_NUMBER_TYPE_ADDED]: {
    name: 'ContactNumberTypeAdded',
    description: 'The Contact Number Type has been created'
  },
  [EventsEnum.CLIENT_CONTACT_NUMBER_ADDED]: {
    name: 'ClientContactNumberAdded',
    description: 'The Client Contact Number has been created'
  }
};
