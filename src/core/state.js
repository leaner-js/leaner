import { isPlainObjectOrArray } from '../shared/utils.js';
import { track } from './deps.js';

const stateGetterHandler = {
  get: stateGetterGet,
  apply: stateGetterApply,
  set() {
    throw new TypeError( 'Mutating a state getter is not allowed' );
  },
  deleteProperty() {
    throw new TypeError( 'Mutating a state getter is not allowed' );
  },
};

const stateGetterRecords = new WeakMap();

function stateGetterGet( target, prop ) {
  if ( prop === 'get' ) {
    return arg => {
      if ( typeof arg == 'function' )
        return createDynamicStateRecord( target, arg ).proxy;
      else
        return createChildStateRecord( target, arg ).proxy;
    };
  }

  if ( prop === Symbol.toPrimitive )
    throw new Error( 'Using a state getter as a primitive value is not allowed' );

  return createChildStateRecord( target, prop ).proxy;
}

export function stateGetterApply( target ) {
  const value = target();

  if ( isPlainObjectOrArray( value ) ) {
    const record = stateGetterRecords.get( target );
    return createReaderRecord( record, value ).proxy;
  }

  return value;
}

function createRecord( prop, getter ) {
  return {
    prop,
    target: getter,
    proxy: new Proxy( getter, stateGetterHandler ),
    children: null,
    reader: null,
    watches: null,
  };
}

export function createRootStateRecord( getter ) {
  const record = createRecord( '(root)', getter );

  stateGetterRecords.set( getter, record );

  return record;
}

export function createChildStateRecord( target, prop ) {
  const record = stateGetterRecords.get( target );

  if ( record.children != null && record.children[ prop ] != null )
    return record.children[ prop ];

  if ( record.children == null )
    record.children = Object.create( null );

  const childRecord = createRecord( prop, getter );

  function getter() {
    const value = target();
    track( childRecord );
    return value[ prop ];
  };

  stateGetterRecords.set( getter, childRecord );

  record.children[ prop ] = childRecord;

  return childRecord;
}

function createDynamicStateRecord( target, arg ) {
  const dynamicRecord = {
    prop: '(dynamic)',
    target: getter,
    proxy: new Proxy( getter, stateGetterHandler ),
  };

  function getter() {
    const value = target();
    const index = arg();
    track( createChildStateRecord( target, index ) );
    return value[ index ];
  }

  stateGetterRecords.set( getter, dynamicRecord );

  return dynamicRecord;
}

const stateReaderHandler = {
  get: stateReaderGet,
  set() {
    throw new TypeError( 'Mutating a reactive value is not allowed' );
  },
  deleteProperty() {
    throw new TypeError( 'Mutating a reactive value is not allowed' );
  },
};

const stateReaderRecords = new WeakMap();

const stateReaderProxies = new WeakMap();

function stateReaderGet( target, prop ) {
  const record = stateReaderRecords.get( target );

  const childRecord = createChildStateRecord( record.target, prop );

  track( childRecord );

  const value = target[ prop ];

  if ( isPlainObjectOrArray( value ) )
    return createReaderRecord( childRecord, value ).proxy;

  return value;
}

function createReaderRecord( record, value ) {
  if ( record.reader != null && record.reader.value === value )
    return record.reader;

  // reuse an existing record; this happens e.g. if an array was rearranged using splice/unshift
  const existingRecord = stateReaderRecords.get( value );
  if ( existingRecord != null ) {
    record.reader = existingRecord;
    existingRecord.target = record.target;
    return existingRecord;
  }

  record.reader = {
    value,
    target: record.target,
    proxy: new Proxy( value, stateReaderHandler ),
  };

  stateReaderRecords.set( value, record.reader );
  stateReaderProxies.set( record.reader.proxy, value );

  return record.reader;
}

export function isStateReader( value ) {
  return stateReaderProxies.has( value );
}

export function unwrapValue( value ) {
  const valueTarget = stateReaderProxies.get( value );
  if ( valueTarget != null )
    return valueTarget;

  unwrapProperties( value, stateReaderProxies, new WeakSet() );

  return value;
}

export function unwrapProperties( value, map, visited ) {
  visited.add( value );

  for ( const key in value ) {
    const prop = value[ key ];
    if ( isPlainObjectOrArray( prop ) && !visited.has( prop ) ) {
      const valueTarget = map.get( prop );
      if ( valueTarget != null )
        value[ key ] = valueTarget;
      else
        unwrapProperties( prop, map, visited );
    }
  }
}
