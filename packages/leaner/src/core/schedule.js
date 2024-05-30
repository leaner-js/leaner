import { createWatcher } from './deps.js';

let scheduled = null;

export function schedule( callback ) {
  scheduleWatcher( createWatcher( null, callback, true ) );
}

export function scheduleWatcher( watcher ) {
  if ( scheduled == null ) {
    scheduled = new Set();
    Promise.resolve().then( runSchedule );
  }

  scheduled.add( watcher );
}

export function runSchedule() {
  if ( scheduled != null ) {
    const watchers = scheduled.values();
    scheduled = null;

    for ( const watcher of watchers ) {
      const callback = watcher.callback;
      if ( callback != null )
        callback();
    }
  }
}

export function clearSchedule() {
  scheduled = null;
}
