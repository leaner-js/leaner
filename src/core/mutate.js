import { isPlainObjectOrArray } from '../shared/utils.js';
import { createChildStateRecord } from './state.js';

export class Mutator {
  constructor( callback ) {
    this.callback = callback;
  }
}

export function mutate( callback ) {
  return new Mutator( callback );
}

export function applyMutator( record, value, callback ) {
  mutableValues = new WeakMap();
  mutableValues.set( value, record );

  const proxy = new Proxy( value, stateMutatorHandler );

  stateMutatorTargets = new WeakMap();
  stateMutatorTargets.set( proxy, value );

  mutated = new Set();

  try {
    callback( proxy );

    return mutated;
  } finally {
    mutableValues = null;
    stateMutatorTargets = null;
    mutated = null;
  }
}

const stateMutatorHandler = {
  get: stateMutatorGet,
  set: stateMutatorSet,
  deleteProperty: stateMutatorDelete,
};

let mutableValues = null;
let stateMutatorTargets = null;

let mutated = null;

function stateMutatorGet( target, prop ) {
  const value = target[ prop ];

  if ( isPlainObjectOrArray( value ) ) {
    const record = mutableValues.get( target );

    const childRecord = createChildStateRecord( record.target, prop );
    mutableValues.set( value, childRecord );

    const proxy = new Proxy( value, stateMutatorHandler );
    stateMutatorTargets.set( proxy, value );

    return proxy;
  }

  return value;
}

function stateMutatorSet( target, prop, value ) {
  const record = mutableValues.get( target );

  if ( Array.isArray( target ) && isIntegerKey( prop ) && Number( prop ) >= target.length ) {
    // the length of the array is changed implicitly when a new element is added
    const lengthRecord = createChildStateRecord( record.target, 'length' );
    mutated.add( lengthRecord );
  }

  if ( isPlainObjectOrArray( value ) ) {
    const valueTarget = stateMutatorTargets.get( value );
    if ( valueTarget != null )
      value = valueTarget;
  }

  if ( target[ prop ] === value )
    return true;

  target[ prop ] = value;

  const childRecord = createChildStateRecord( record.target, prop );
  mutated.add( childRecord );

  return true;
}

function stateMutatorDelete( target, prop ) {
  if ( !( prop in target ) )
    return true;

  delete target[ prop ];

  const record = mutableValues.get( target );

  const childRecord = createChildStateRecord( record.target, prop );
  mutated.add( childRecord );

  return true;
}

function isIntegerKey( key ) {
  return typeof key == 'string' && key != 'NaN' && key[ 0 ] != '-' && '' + parseInt( key, 10 ) == key;
}
