import { scheduleWatcher } from "./schedule";

let deps = null;

export function track( record ) {
  if ( deps != null )
    deps.add( record );
}

export function react( record ) {
  for ( const watcher of record.values() ) {
    const callback = watcher.callback;
    if ( callback != null ) {
      if ( watcher.async )
        scheduleWatcher( watcher );
      else
        callback();
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
  if ( async )
    callback = createSafeCallback( callback );

  const watcher = {
    deps,
    callback,
    async,
  };

  if ( current != null )
    current.watchers.push( watcher );

  if ( deps != null ) {
    for ( const dep of deps ) {
      dep.add( watcher );
    }
  }

  return watcher;
}

function createSafeCallback( callback ) {
  if ( current != null && current.errorHandler != null ) {
    const handler = current.errorHandler;

    return safeCallback;

    function safeCallback() {
      try {
        callback();
      } catch ( err ) {
        handler( err );
      }
    }
  }

  return callback;
}

export function updateWatcher( watcher, deps ) {
  for ( const dep of deps ) {
    dep.add( watcher );
    if ( watcher.deps != null )
      watcher.deps.delete( dep );
  }

  if ( watcher.deps != null ) {
    for ( const dep of watcher.deps )
      dep.delete( watcher );
  }

  watcher.deps = deps;
}

export function destroyScope( scope ) {
  for ( const watcher of scope.watchers ) {
    watcher.callback = null;

    if ( watcher.deps != null ) {
      for ( const dep of watcher.deps )
        dep.delete( watcher );
      watcher.deps = null;
    }
  }
}
