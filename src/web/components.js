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
  return {
    parent,
    children: null,
    mount: null,
    destroy: null,
  };
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
    return callback();
  } finally {
    current = last;
  }
}

export function withChildContext( callback ) {
  current = createChildContext();
  try {
    return callback();
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

export function mountContext( context ) {
  if ( context.children != null ) {
    for ( const child of context.children )
      mountContext( child );
  }

  if ( context.mount != null ) {
    for ( const callback of context.mount )
      callback();
  }
}

export function destroyContext( context ) {
  if ( context.destroy != null ) {
    for ( const callback of context.destroy )
      callback();
  }

  if ( context.children != null ) {
    for ( const child of context.children )
      destroyContext( child );

    context.children = null;
  }
}
