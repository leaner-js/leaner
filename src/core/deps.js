let deps = null;

export function track( record ) {
  if ( deps != null )
    deps.add( record );
}

export function react( record ) {
  if ( record.watches != null ) {
    for ( const watch of record.watches.values() )
      watch();
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

export function updateDeps( newDeps, deps, callback ) {
  for ( const dep of newDeps ) {
    if ( dep.watches == null )
      dep.watches = new Set();
    dep.watches.add( callback );
    if ( deps != null )
      deps.delete( dep );
  }

  if ( deps != null ) {
    for ( const dep of deps )
      dep.watches.delete( callback );
  }

  return newDeps;
}
