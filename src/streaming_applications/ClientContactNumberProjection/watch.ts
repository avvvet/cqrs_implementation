import {ClientContactNumberProjectionPipeline} from './ClientContactNumberProjectionPipeline';
import {Watcher, WatcherContext} from '../core/Watcher';

const pipelines = [new ClientContactNumberProjectionPipeline()];
const watcherContext: WatcherContext = Watcher.getWatcherContext('ClientContactNumberProjection', pipelines);

export default watcherContext;
