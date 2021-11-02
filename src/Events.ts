export enum EventsEnum {
  CONTACT_NUMBER_TYPE_ADDED = 'ContactNumberTypeAdded'
}

type EventsType = {
  [key in EventsEnum]: {name: string; description: string};
};

export const events: EventsType = {
  [EventsEnum.CONTACT_NUMBER_TYPE_ADDED]: {
    name: 'ContactNumberTypeAdded',
    description: 'The Contact Number Type has been created'
  }
};
