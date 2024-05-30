import { isPlainObjectOrArray } from '../shared/utils.js';
import { isStateReaderProxy } from './state.js';

const computedGetterHandler = {
  get: computedGetterGet,
  apply: computedGetterApply,
  set() {
    throw new TypeError( 'Mutating a computed getter is not allowed' );
  },
  deleteProperty() {
    throw new TypeError( 'Mutating a computed getter is not allowed' );
  },
};

function computedGetterGet( target, prop ) {
  if ( prop === 'get' ) {
    return arg => {
      if ( typeof arg == 'function' )
        return createDynamicComputedProxy( target, arg );
      else
        return createChildComputedProxy( target, arg );
    };
  }

  if ( prop == Symbol.toPrimitive )
    throw new Error( 'Cannot use a computed getter as array index; use the get() method instead' );

  return createChildComputedProxy( target, prop );
}

export function createRootComputedProxy( getter ) {
  return new Proxy( getter, computedGetterHandler );
}

function createChildComputedProxy( target, prop ) {
  return new Proxy( getter, computedGetterHandler );

  function getter() {
    return target()[ prop ];
  }
}

function createDynamicComputedProxy( target, arg ) {
  return new Proxy( getter, computedGetterHandler );

  function getter() {
    return target()[ arg() ];
  }
}

function computedGetterApply( target ) {
  const value = target();

  if ( isPlainObjectOrArray( value ) && !isStateReaderProxy( value ) )
    return new Proxy( value, computedReaderHandler );

  return value;
}

const computedReaderHandler = {
  get: computedReaderGet,
  set() {
    throw new TypeError( 'Mutating a computed value is not allowed' );
  },
  deleteProperty() {
    throw new TypeError( 'Mutating a computed value is not allowed' );
  },
};

function computedReaderGet( target, prop ) {
  const value = target[ prop ];

  if ( isPlainObjectOrArray( value ) && !isStateReaderProxy( value ) )
    return new Proxy( value, computedReaderHandler );

  return value;
}
