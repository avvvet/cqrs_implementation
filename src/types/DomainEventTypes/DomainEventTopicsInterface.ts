import {DomainEventSubscriberInterface} from './DomainEventSubscriberInterface';

export interface DomainEventTopicsInterface {
  name: string;
  subscribers: DomainEventSubscriberInterface[];
}
