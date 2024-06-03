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

const stateGetterCache = new WeakMap();

function stateGetterGet( target, prop ) {
  if ( prop === 'get' ) {
    return arg => {
      if ( typeof arg == 'function' )
        return createDynamicStateGetterProxy( target, arg );
      else
        return createChildStateGetterProxy( target, arg );
    };
  }

  if ( prop === Symbol.toPrimitive )
    throw new Error( 'Using a state getter as a primitive value is not allowed' );

  return createChildStateGetterProxy( target, prop );
}

export function createRootStateGetterProxy( getter ) {
  return new Proxy( getter, stateGetterHandler );
}

function createChildStateGetterProxy( target, prop ) {
  let cache = stateGetterCache.get( target );

  if ( cache == null ) {
    cache = Object.create( null );
    stateGetterCache.set( target, cache );
  }

  let proxy = cache[ prop ];

  if ( proxy == null ) {
    proxy = new Proxy( getter, stateGetterHandler );
    cache[ prop ] = proxy;
  }

  return proxy;

  function getter() {
    const value = target();

    if ( isPlainObjectOrArray( value ) )
      trackProperty( value, prop );

    return value[ prop ];
  }
}

function createDynamicStateGetterProxy( target, arg ) {
  return new Proxy( getter, stateGetterHandler );

  function getter() {
    const value = target();
    const prop = arg();

    if ( isPlainObjectOrArray( value ) )
      trackProperty( value, prop );

    return value[ prop ];
  }
}

export function stateGetterApply( target ) {
  const value = target();

  if ( isPlainObjectOrArray( value ) )
    return createStateReader( value ).proxy;

  return value;
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

const stateReaders = new WeakMap();
const stateReaderTargets = new WeakMap();

function stateReaderGet( target, prop ) {
  trackProperty( target, prop );

  const value = target[ prop ];

  if ( isPlainObjectOrArray( value ) )
    return createStateReader( value ).proxy;

  return value;
}

function trackProperty( target, prop ) {
  const reader = createStateReader( target );

  if ( reader.props == null )
    reader.props = Object.create( null );

  let record = reader.props[ prop ];

  if ( record == null ) {
    record = new Set();
    reader.props[ prop ] = record;
  }

  track( record );
}

function createStateReader( value ) {
  let reader = stateReaders.get( value );

  if ( reader == null ) {
    reader = {
      proxy: new Proxy( value, stateReaderHandler ),
      props: null,
    };
    stateReaders.set( value, reader );
    stateReaderTargets.set( reader.proxy, value );
  }

  return reader;
}

export function getStateReader( value ) {
  return stateReaders.get( value );
}

export function isStateReaderProxy( value ) {
  return stateReaderTargets.has( value );
}

export function unwrapStateReaderProxy( value ) {
  const valueTarget = stateReaderTargets.get( value );
  if ( valueTarget != null )
    return valueTarget;

  unwrapProperties( value, stateReaderTargets, new WeakSet() );

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
