let scheduled = null;

export function schedule( callback ) {
  if ( scheduled == null ) {
    scheduled = new Set();
    Promise.resolve().then( runSchedule );
  }

  scheduled.add( callback );
}

export function runSchedule() {
  if ( scheduled != null ) {
    const callbacks = scheduled.values();
    scheduled = null;

    for ( const callback of callbacks )
      callback();
  }
}

export function clearSchedule() {
  scheduled = null;
}
