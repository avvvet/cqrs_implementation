import {LoggerContext} from 'a24-logzio-winston';
import {MongoClient, Db, MongoClientOptions} from 'mongodb';
import {isString} from 'lodash';
import config from 'config';

const configKeys: {[key in string]: number} = {};
const clients: {[key in string]: MongoClient} = {};

/**
 * Basic connection manager to ensure we have one connection with a sane pool size
 * Expects the config key to have the structure {database_host: <connection string>, options: {}}
 */
export class MongoClients {
  private static _instance: MongoClients;
  public static getInstance(): MongoClients {
    return this._instance || (this._instance = new this());
  }

  /**
   * Wrapper to easily get a database instance of a client
   *
   * @param {Object} logger - Instance of the logger
   * @param {String} configKey - The config key
   *
   * @returns {MongoClient.db}
   */
  async getClientDatabase(logger: LoggerContext, configKey: string): Promise<Db> {
    const client = await this.getClient(logger, configKey);

    return client.db();
  }

  /**
   * Returns an instance of the client, ensures we only have 1 instance with a runtime determined pool size
   *
   * @param {Object} logger - Instance of the logger
   * @param {String} configKey - The config key
   *
   * @returns {MongoClient}
   */
  async getClient(logger: LoggerContext, configKey: string): Promise<MongoClient> {
    if (clients[configKey]) {
      return clients[configKey];
    }
    const options = {
      poolSize: configKeys[configKey] > 5 ? configKeys[configKey] : 5,
      ...config.get<MongoClientOptions>(`${configKey}.options`)
    };
    const client = new MongoClient(config.get<string>(`${configKey}.database_host`), options);

    clients[configKey] = client;
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db().command({ping: 1});
    logger.info('Connection successful', {config_key: configKey});

    return clients[configKey];
  }

  /**
   * Simply counts the number of instances using the keys
   *   We use this to set the pool size at runtime
   *
   * @param {String|Array<String>} configKeyListing - The config keys
   */
  registerClientConfigs(configKeyListing: string[] | string): void {
    if (isString(configKeyListing)) {
      return this.applyKeyCount(configKeyListing);
    }
    for (const item of configKeyListing) {
      this.applyKeyCount(item);
    }
  }

  /**
   * Basic counter method
   *
   * @param {String} key - The config key
   */
  private applyKeyCount(key: string): void {
    if (configKeys[key]) {
      configKeys[key]++;
    } else {
      configKeys[key] = 1;
    }
  }
}
