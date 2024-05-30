import { isPlainObjectOrArray } from '../shared/utils.js';
import { getStateReader, unwrapProperties } from './state.js';

export class Mutator {
  constructor( callback ) {
    this.callback = callback;
  }
}

export function mutate( callback ) {
  return new Mutator( callback );
}

export function applyMutator( value, callback ) {
  const proxy = new Proxy( value, stateMutatorHandler );

  stateMutatorTargets = new WeakMap();
  stateMutatorTargets.set( proxy, value );

  mutated = new Set();

  try {
    callback( proxy );
    return mutated;
  } finally {
    stateMutatorTargets = null;
    mutated = null;
  }
}

const stateMutatorHandler = {
  get: stateMutatorGet,
  set: stateMutatorSet,
  deleteProperty: stateMutatorDelete,
};

let stateMutatorTargets = null;

let mutated = null;

function stateMutatorGet( target, prop ) {
  const value = target[ prop ];

  if ( isPlainObjectOrArray( value ) ) {
    const proxy = new Proxy( value, stateMutatorHandler );
    stateMutatorTargets.set( proxy, value );
    return proxy;
  }

  return value;
}

function stateMutatorSet( target, prop, value ) {
  const reader = getStateReader( target );

  if ( reader != null && reader.props != null ) {
    if ( Array.isArray( target ) && isIntegerKey( prop ) && Number( prop ) >= target.length ) {
      // the length of the array is changed implicitly when a new element is added
      const record = reader.props.length;
      if ( record != null )
        mutated.add( record );
    }
  }

  if ( isPlainObjectOrArray( value ) ) {
    const valueTarget = stateMutatorTargets.get( value );
    if ( valueTarget != null )
      value = valueTarget;
    else
      unwrapProperties( value, stateMutatorTargets, new WeakSet() );
  }

  if ( target[ prop ] === value )
    return true;

  target[ prop ] = value;

  if ( reader != null && reader.props != null ) {
    const record = reader.props[ prop ];
    if ( record != null )
      mutated.add( record );
  }

  return true;
}

function stateMutatorDelete( target, prop ) {
  if ( !( prop in target ) )
    return true;

  delete target[ prop ];

  const reader = getStateReader( target );

  if ( reader != null && reader.props != null ) {
    const record = reader.props[ prop ];
    if ( record != null )
      mutated.add( record );
  }

  return true;
}

function isIntegerKey( key ) {
  return typeof key == 'string' && key != 'NaN' && key[ 0 ] != '-' && '' + parseInt( key, 10 ) == key;
}
