import { constant, destroyScope, reactive, state, withScope } from 'leaner';
import { isPlainObjectOrArray } from '../shared/utils.js';
import { createChildContext, createContext, destroyContext, mountContext, withContext } from './components.js';
import { make } from './make.js';
import { DynamicNode, ensureNotEmpty, replaceNode } from './nodes.js';

export function createForDirective( template ) {
  if ( template.length != 3 || typeof template[ 1 ] != 'function' || typeof template[ 2 ] != 'function' )
    throw new TypeError( 'Invalid for template' );

  const itemsGetter = template[ 1 ];
  const callback = template[ 2 ];
  const useIndexes = callback.length > 1;

  let length = 0;
  let items = null;

  let watchingContent = false;

  let indexStates = null;

  const result = new DynamicNode( null );

  const context = createChildContext();

  withScope( context.scope, () => {
    // initially only watch the length of the items array
    reactive( itemsGetter.length, updateLength );
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

    let newIndexStates = null;

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

        if ( useIndexes && isMatchedByValue ) {
          // update the index passed to the child if it's reordered
          const indexState = indexStates.get( oldIndex );
          if ( oldIndex != index )
            indexState[ 1 ]( index );
          if ( newIndexStates == null )
            newIndexStates = new Map();
          newIndexStates.set( index, indexState );
        }
      } else {
        const itemContext = createContext( context );
        itemContexts.push( itemContext );

        if ( newItemContexts == null )
          newItemContexts = [];
        newItemContexts.push( itemContext );

        const item = isMatchedByValue ? constant( value ) : itemsGetter[ index ];

        let itemTemplate;

        if ( useIndexes ) {
          let indexGetter;

          if ( isMatchedByValue ) {
            // index can change in the future - use reactive state
            const indexState = state( index );
            if ( newIndexStates == null )
              newIndexStates = new Map();
            newIndexStates.set( index, indexState );
            indexGetter = indexState[ 0 ];
          } else {
            indexGetter = constant( index );
          }

          itemTemplate = callback( item, indexGetter );
        } else {
          itemTemplate = callback( item );
        }

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

    indexStates = newIndexStates;

    if ( containsMatchedByValue && !watchingContent ) {
      destroyScope( context.scope );
      context.scope.watchers = [];
      withScope( context.scope, () => {
        // clone the array to watch all elements
        reactive( () => [ ...itemsGetter() ], updateContent );
      } );
      watchingContent = true;
    }
  }
}
