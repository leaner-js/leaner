import { useConstant, useReactiveWatch } from 'leaner';
import { isPlainObjectOrArray } from '../shared/utils.js';
import { createChildContext, createContext, destroyContext, mountContext, withContext } from './components.js';
import { make } from './make.js';
import { DynamicNode, ensureNotEmpty, replaceNode } from './nodes.js';

export function createForDirective( template ) {
  if ( template.length != 3 || typeof template[ 1 ] != 'function' || typeof template[ 2 ] != 'function' )
    throw new TypeError( 'Invalid for template' );

  let length = 0;
  let items = null;

  let watchingContent = false;

  const result = new DynamicNode( null );

  const context = createChildContext();

  useReactiveWatch( watchLength, updateLength );

  return result;

  function watchLength() {
    if ( !watchingContent )
      return template[ 1 ].length();
  }

  function updateLength( newLength ) {
    if ( !watchingContent ) {
      update( template[ 1 ]() );
      length = newLength;
    }
  }

  function watchContent() {
    // clone the array to watch all elements
    return [ ...template[ 1 ]() ];
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

    for ( let index = 0; index < newItems.length; index++ ) {
      const value = newItems[ index ];

      const isMatchedByValue = isPlainObjectOrArray( value );

      if ( isMatchedByValue )
        containsMatchedByValue = true;

      let oldIndex = -1;

      // reuse existing items - objects and arrays are matched by value, other items by index
      if ( result.content != null ) {
        if ( isMatchedByValue ) {
          if ( items != null )
            oldIndex = items.indexOf( value );
        } else if ( index < length ) {
          if ( items == null || !isPlainObjectOrArray( items[ index ] ) )
            oldIndex = index;
        }
      }

      if ( oldIndex >= 0 ) {
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

        const item = isMatchedByValue ? useConstant( value ) : template[ 1 ][ index ];

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
      useReactiveWatch( watchContent, updateContent );
      watchingContent = true;
    }
  }
}
