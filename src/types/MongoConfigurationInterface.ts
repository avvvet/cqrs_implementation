import {ConnectOptions} from 'mongoose';

export interface MongoConfigurationInterface {
  database_host: string;
  options: ConnectOptions;
}
