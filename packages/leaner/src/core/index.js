import { isPlainObjectOrArray } from '../shared/utils.js';
import { createRootComputedProxy } from './computed.js';
import { addDeps, createWatcher, destroyScope, react, track, updateWatcher, withDeps, withScope } from './deps.js';
import { Mutator, applyMutator, mutate } from './mutate.js';
import { schedule, scheduleWatcher } from './schedule.js';
import { createRootStateGetterProxy, stateGetterApply, unwrapStateReaderProxy } from './state.js';

export function useState( initial ) {
  let current = initial;

  const record = new Set();

  const proxy = createRootStateGetterProxy( getter );

  return [ proxy, setter ];

  function getter() {
    track( record );
    return current;
  };

  function setter( value ) {
    if ( value instanceof Mutator ) {
      if ( !isPlainObjectOrArray( current ) )
        throw new TypeError( 'Only plain objects and arrays can be mutated' );

      const mutated = applyMutator( current, value.callback );

      for ( const record of mutated )
        react( record );
    } else {
      if ( typeof value == 'function' ) {
        const readOnlyValue = stateGetterApply( getter );

        value = value( readOnlyValue );

        if ( isPlainObjectOrArray( value ) )
          value = unwrapStateReaderProxy( value );
      }

      if ( current !== value ) {
        current = value;
        react( record );
      }
    }
  }
}

export function useWatchEffect( callback ) {
  const watcher = createWatcher( null, update, false );

  update();

  function update() {
    const [ _, deps ] = withDeps( callback );

    updateWatcher( watcher, deps );
  }
}

export function useWatch( getter, callback ) {
  let [ value, deps ] = withDeps( getter );

  const watcher = createWatcher( deps, update, false );

  deps = null;

  function update() {
    const [ newValue, newDeps ] = withDeps( getter );

    updateWatcher( watcher, newDeps );

    if ( newValue !== value ) {
      callback( newValue, value );
      value = newValue;
    }
  }
}

export function useEffect( callback ) {
  const watcher = createWatcher( null, update, true );

  scheduleWatcher( watcher );

  function update() {
    const [ _, deps ] = withDeps( callback );

    updateWatcher( watcher, deps );
  }
}

export function useReactive( callback ) {
  const watcher = createWatcher( null, update, true );

  update();

  function update() {
    const [ _, deps ] = withDeps( callback );

    updateWatcher( watcher, deps );
  }
}

export function useReactiveWatch( getter, callback ) {
  let value;

  const watcher = createWatcher( null, update, true );

  update( true );

  function update( force ) {
    const [ newValue, deps ] = withDeps( getter );

    updateWatcher( watcher, deps );

    if ( force || newValue !== value ) {
      callback( newValue, value );
      value = newValue;
    }
  }
}

export function useComputed( callback ) {
  let value, valid = false;

  const watcher = createWatcher( null, invalidate, false );

  return createRootComputedProxy( execute );

  function execute() {
    if ( watcher.callback == null )
      throw new Error( 'A destroyed computed value cannot be used' );

    if ( !valid ) {
      const [ newValue, deps ] = withDeps( callback );

      updateWatcher( watcher, deps );

      value = newValue;
      valid = true;
    }

    addDeps( watcher.deps );

    return value;
  }

  function invalidate() {
    value = undefined;
    valid = false;
  }
}

export function useConstant( value ) {
  return createRootComputedProxy( getter );

  function getter() {
    return value;
  }
}

export { destroyScope, mutate, schedule, withScope };
