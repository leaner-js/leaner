import { reactive, withScope } from 'leaner';
import { createChildContext, createContext, destroyContext, mountContext, withContext } from './components.js';
import { make } from './make.js';
import { DynamicNode, ensureNotEmpty, replaceNode } from './nodes.js';

export function createRepeatDirective( template ) {
  if ( template.length != 3 || typeof template[ 2 ] != 'function' )
    throw new TypeError( 'Invalid repeat template' );

  let count = 0;

  const result = new DynamicNode( null );

  const context = createChildContext();

  if ( typeof template[ 1 ] == 'function' ) {
    withScope( context.scope, () => {
      reactive( template[ 1 ], updateCount );
    } );
  } else {
    updateCount( template[ 1 ] );
  }

  return result;

  function updateCount( newCount ) {
    if ( newCount > count ) {
      const nodes = result.content != null ? result.content.slice( 0, count ) : [];
      const contexts = context.children != null ? context.children.slice( 0, count ) : [];

      for ( let i = count; i < newCount; i++ ) {
        const itemContext = createContext( context );
        contexts.push( itemContext );

        const itemTemplate = template[ 2 ]( i );

        const node = withContext( itemContext, () => make( itemTemplate ) );

        if ( Array.isArray( node ) )
          nodes.push( new DynamicNode( node ) );
        else
          nodes.push( node );
      }

      if ( result.content != null ) {
        replaceNode( nodes, result.content );

        for ( let i = count; i < newCount; i++ )
          mountContext( contexts[ i ] );
      }

      result.content = nodes;
      context.children = contexts;
    } else {
      for ( let i = newCount; i < count; i++ )
        destroyContext( context.children[ i ] );

      const nodes = result.content != null ? result.content.slice( 0, newCount ) : [];
      ensureNotEmpty( nodes );

      if ( result.content != null )
        replaceNode( nodes, result.content );

      result.content = nodes;

      if ( newCount == 0 )
        context.children = null;
      else if ( context.children != null )
        context.children = context.children.slice( 0, newCount );
    }

    count = newCount;
  }
}
