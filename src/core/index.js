import { createRootComputedProxy } from './computed.js';
import { addDeps, react, track, updateDeps, withDeps } from './deps.js';
import { Mutator, applyMutator, mutate } from './mutate.js';
import { schedule } from './schedule.js';
import { createRootStateRecord, stateGetterApply } from './state.js';

export function useState( initial ) {
  let current = initial;

  const record = createRootStateRecord( getter );

  return [ record.proxy, setter ];

  function getter() {
    track( record );
    return current;
  };

  function setter( value ) {
    if ( value instanceof Mutator ) {
      const mutated = applyMutator( record, current, value.callback );

      for ( const record of mutated )
        react( record );
    } else {
      if ( typeof value == 'function' ) {
        const readOnlyValue = stateGetterApply( getter );
        value = value( readOnlyValue );
      }

      if ( current !== value ) {
        current = value;
        react( record );
      }
    }
  }
}

export function useWatchEffect( callback ) {
  let deps = null;

  update();

  function update() {
    const [ _, newDeps ] = withDeps( callback );

    deps = updateDeps( newDeps, deps, update );
  }
}

export function useWatch( getter, callback ) {
  let [ value, deps ] = withDeps( getter );

  updateDeps( deps, null, update );

  function update() {
    const [ newValue, newDeps ] = withDeps( getter );

    deps = updateDeps( newDeps, deps, update );

    if ( newValue !== value ) {
      callback( newValue, value );
      value = newValue;
    }
  }
}

export function useEffect( callback ) {
  let deps = null;

  schedule( update );

  function update() {
    const [ _, newDeps ] = withDeps( callback );

    deps = updateDeps( newDeps, deps, () => schedule( update ) );
  }
}

export function useReactive( callback ) {
  let deps = null;

  update();

  function update() {
    const [ _, newDeps ] = withDeps( callback );

    deps = updateDeps( newDeps, deps, () => schedule( update ) );
  }
}

export function useReactiveWatch( getter, callback ) {
  let value = null, deps = null;

  update( true );

  function update( force ) {
    const [ newValue, newDeps ] = withDeps( getter );

    deps = updateDeps( newDeps, deps, () => schedule( update ) );

    if ( force || newValue !== value ) {
      callback( newValue, value );
      value = newValue;
    }
  }
}

export function useComputed( callback ) {
  let deps = null, value = null, valid = false;

  return createRootComputedProxy( execute );

  function execute() {
    if ( !valid ) {
      const [ newValue, newDeps ] = withDeps( callback );

      deps = updateDeps( newDeps, deps, invalidate );

      value = newValue;
      valid = true;
    }

    addDeps( deps );

    return value;
  }

  function invalidate() {
    value = null;
    valid = false;
  }
}

export function useConstant( value ) {
  return createRootComputedProxy( getter );

  function getter() {
    return value;
  }
}

export { mutate, schedule };
