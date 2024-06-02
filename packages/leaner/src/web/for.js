import { destroyScope, useConstant, useReactiveWatch, withScope } from 'leaner';
import { isPlainObjectOrArray } from '../shared/utils.js';
import { createChildContext, createContext, destroyContext, mountContext, withContext } from './components.js';
import { make } from './make.js';
import { DynamicNode, ensureNotEmpty, replaceNode } from './nodes.js';

export function createForDirective( template ) {
  if ( template.length != 3 || typeof template[ 1 ] != 'function' || typeof template[ 2 ] != 'function' )
    throw new TypeError( 'Invalid for template' );

  const itemsGetter = template[ 1 ];

  let length = 0;
  let items = null;

  let watchingContent = false;

  const result = new DynamicNode( null );

  const context = createChildContext();

  withScope( context.scope, () => {
    // initially only watch the length of the items array
    useReactiveWatch( itemsGetter.length, updateLength );
  } );

  return result;

  function updateLength( newLength ) {
    update( itemsGetter() );
    length = newLength;
  }

  function updateContent( newItems ) {
    if ( watchingContent )
      update( newItems );
    items = newItems;
    length = newItems.length;
  }

  function update( newItems ) {
    const nodes = [];
    const itemContexts = [];

    const oldItemContexts = context.children != null ? new Set( context.children ) : null;
    let newItemContexts = null;

    let containsMatchedByValue = false;

    let oldIndexMap = null;
    if ( watchingContent && items.length != 0 && newItems.length != 0 ) {
      oldIndexMap = new Map();
      for ( let i = 0; i < items.length; i++ )
        oldIndexMap.set( items[ i ], i );
    }

    for ( let index = 0; index < newItems.length; index++ ) {
      const value = newItems[ index ];

      const isMatchedByValue = isPlainObjectOrArray( value );

      if ( isMatchedByValue )
        containsMatchedByValue = true;

      let oldIndex = null;

      // reuse existing items - objects and arrays are matched by value, other items by index
      if ( result.content != null ) {
        if ( isMatchedByValue ) {
          if ( oldIndexMap != null )
            oldIndex = oldIndexMap.get( value );
        } else if ( index < length ) {
          if ( items == null || !isPlainObjectOrArray( items[ index ] ) )
            oldIndex = index;
        }
      }

      if ( oldIndex != null ) {
        nodes.push( result.content[ oldIndex ] );

        const itemContext = context.children[ oldIndex ];
        itemContexts.push( itemContext );

        if ( oldItemContexts != null )
          oldItemContexts.delete( itemContext );
      } else {
        const itemContext = createContext( context );
        itemContexts.push( itemContext );

        if ( newItemContexts == null )
          newItemContexts = [];
        newItemContexts.push( itemContext );

        const item = isMatchedByValue ? useConstant( value ) : itemsGetter[ index ];

        const itemTemplate = template[ 2 ]( item, index );

        const node = withContext( itemContext, () => make( itemTemplate ) );

        if ( Array.isArray( node ) )
          nodes.push( new DynamicNode( node ) );
        else
          nodes.push( node );
      }
    }

    ensureNotEmpty( nodes );

    if ( result.content != null ) {
      if ( oldItemContexts != null ) {
        for ( const itemContext of oldItemContexts )
          destroyContext( itemContext );
      }

      replaceNode( nodes, result.content );

      if ( newItemContexts != null ) {
        for ( const itemContext of newItemContexts )
          mountContext( itemContext );
      }
    }

    result.content = nodes;
    if ( itemContexts.length > 0 )
      context.children = itemContexts;
    else
      context.children = null;

    if ( containsMatchedByValue && !watchingContent ) {
      destroyScope( context.scope );
      context.scope = [];
      withScope( context.scope, () => {
        // clone the array to watch all elements
        useReactiveWatch( () => [ ...itemsGetter() ], updateContent );
      } );
      watchingContent = true;
    }
  }
}
