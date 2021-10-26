import {LoggerContext} from 'a24-logzio-winston';
import {IncomingMessage} from 'http';

export interface SwaggerRequestInterface extends IncomingMessage {
  Logger: LoggerContext;
  swagger: {
    params: {[key: string]: unknown};
    operation: {
      'x-public-operation'?: boolean;
    };
  };
  basePathName: string;
}
