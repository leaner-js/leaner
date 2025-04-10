import { destroyScope, withScope } from 'leaner';
import { isPlainObject } from '../shared/utils.js';

let current = null;

export function createComponent( template ) {
  const component = template[ 0 ];

  let props, i = 1;
  if ( i < template.length && isPlainObject( template[ i ] ) )
    props = template[ i++ ];
  else
    props = {};

  const children = template.slice( i );

  return component( props, children );
}

export function createContext( parent ) {
  const context = {
    parent,
    children: null,
    scope: {
      watchers: [],
      errorHandler: err => handleError( context, err ),
    },
    mount: null,
    destroy: null,
    refs: null,
    services: null,
    errorHandler: null,
  };

  return context;
}

export function createChildContext() {
  const context = createContext( current );

  if ( current != null ) {
    if ( current.children == null )
      current.children = [];
    current.children.push( context );
  }

  return context;
}

export function withContext( context, callback ) {
  const last = current;
  current = context;
  try {
    return withScope( current.scope, callback );
  } finally {
    current = last;
  }
}

export function withChildContext( callback ) {
  current = createChildContext();
  try {
    return withScope( current.scope, callback );
  } finally {
    current = current.parent;
  }
}

export function onMount( callback ) {
  if ( current == null )
    throw new Error( 'onMount() cannot be called outside of a component' );
  if ( current.mount == null )
    current.mount = [];
  current.mount.push( callback );
}

export function onDestroy( callback ) {
  if ( current == null )
    throw new Error( 'onDestroy() cannot be called outside of a component' );
  if ( current.destroy == null )
    current.destroy = [];
  current.destroy.push( callback );
}

export function createRef( callback, element ) {
  if ( current != null ) {
    if ( current.refs == null )
      current.refs = [];
    current.refs.push( { callback, element } );
  } else {
    callback( element );
  }
}

export function mountContext( context ) {
  if ( context.children != null ) {
    for ( const child of context.children )
      mountContext( child );
  }

  withContext( context, () => {
    if ( context.refs != null ) {
      for ( const ref of context.refs )
        ref.callback( ref.element );
    }

    if ( context.mount != null ) {
      for ( const callback of context.mount )
        callback();
    }
  } );
}

export function destroyContext( context ) {
  withContext( context, () => {
    if ( context.destroy != null ) {
      for ( const callback of context.destroy )
        callback();
      context.destroy = null;
    }

    if ( context.refs != null ) {
      for ( const ref of context.refs )
        ref.callback( null );
      context.refs = null;
    }
  } );

  context.mount = null;

  if ( context.scope.watchers.length > 0 ) {
    destroyScope( context.scope );
    context.scope.watchers = [];
  }

  if ( context.children != null ) {
    for ( const child of context.children )
      destroyContext( child );
    context.children = null;
  }

  context.services = null;
}

export function cleanUpContext( context ) {
  context.destroy = null;
  context.refs = null;
  context.mount = null;

  if ( context.scope.watchers.length > 0 ) {
    destroyScope( context.scope );
    context.scope.watchers = [];
  }

  if ( context.children != null ) {
    for ( const child of context.children )
      cleanUpContext( child );
    context.children = null;
  }

  context.services = null;
}

export function provide( key, value ) {
  if ( current == null )
    throw new Error( 'provide() cannot be called outside of a component' );

  if ( current.services == null )
    current.services = new Map();

  current.services.set( key, value );
}

export function inject( key ) {
  if ( current == null )
    throw new Error( 'inject() cannot be called outside of a component' );

  for ( let context = current; context != null; context = context.parent ) {
    if ( context.services != null && context.services.has( key ) )
      return context.services.get( key );
  }
}

export function handleError( context, err ) {
  while ( context != null) {
    if ( context.errorHandler != null ) {
      context.errorHandler( err );
      return;
    }
    context = context.parent;
  }
  throw err;
}

export function createSafeHandler( callback ) {
  if ( current != null ) {
    const context = current;

    return safeHandler;

    function safeHandler( e ) {
      try {
        callback( e );
      } catch ( err ) {
        handleError( context, err );
      }
    }
  }

  return callback;
}
