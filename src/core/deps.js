import { scheduleWatcher } from "./schedule";

let deps = null;

export function track( record ) {
  if ( deps != null )
    deps.add( record );
}

export function react( record ) {
  if ( record.watchers != null ) {
    for ( const watcher of record.watchers.values() ) {
      const callback = watcher.callback;
      if ( callback != null ) {
        if ( watcher.async )
          scheduleWatcher( watcher );
        else
          callback();
      }
    }
  }
}

export function withDeps( callback ) {
  const oldDeps = deps;
  deps = new Set();

  try {
    const result = callback();

    return [ result, deps ];
  } finally {
    deps = oldDeps;
  }
}

export function addDeps( newDeps ) {
  if ( deps != null && newDeps != null ) {
    for ( const dep of newDeps.values() )
      deps.add( dep );
  }
}

let current = null;

export function withScope( scope, callback ) {
  const old = current;
  current = scope;

  try {
    return callback();
  } finally {
    current = old;
  }
}

export function createWatcher( deps, callback, async ) {
  const watcher = {
    deps,
    callback,
    async,
  };

  if ( current != null )
    current.push( watcher );

  if ( deps != null ) {
    for ( const dep of deps ) {
      if ( dep.watchers == null )
        dep.watchers = new Set();
      dep.watchers.add( watcher );
    }
  }

  return watcher;
}

export function updateWatcher( watcher, deps ) {
  for ( const dep of deps ) {
    if ( dep.watchers == null )
      dep.watchers = new Set();
    dep.watchers.add( watcher );
    if ( watcher.deps != null )
      watcher.deps.delete( dep );
  }

  if ( watcher.deps != null ) {
    for ( const dep of watcher.deps )
      dep.watchers.delete( watcher );
  }

  watcher.deps = deps;
}

export function destroyScope( scope ) {
  for ( const watcher of scope ) {
    watcher.callback = null;

    if ( watcher.deps != null ) {
      for ( const dep of watcher.deps )
        dep.watchers.delete( watcher );
      watcher.deps = null;
    }
  }
}
