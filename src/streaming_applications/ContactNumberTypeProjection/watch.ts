import {ContactNumberTypeProjectionPipeline} from './ContactNumberTypeProjectionPipeline';
import {Watcher, WatcherContext} from '../core/Watcher';

const pipelines = [new ContactNumberTypeProjectionPipeline()];
const watcherContext: WatcherContext = Watcher.getWatcherContext('ClientEventLogProjection', pipelines);

export default watcherContext;
