import {ClientContactNumberProjectionPipeline} from './ClientContactNumberProjectionPipeline';
import {Watcher, WatcherContext} from '../core/Watcher';

const pipelines = [new ClientContactNumberProjectionPipeline()];
const watcherContext: WatcherContext = Watcher.getWatcherContext('ClientEventLogProjection', pipelines);

export default watcherContext;
