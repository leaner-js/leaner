import { createContext, destroyContext, inject, mountContext, onDestroy, onMount, provide, withContext } from './components.js';
import { make } from './make.js';
import { appendNode, removeNode } from './nodes.js';

export function createApp( component ) {
  const context = createContext( null );

  let root;

  return {
    mount( target ) {
      root = withContext( context, () => make( component( {}, [] ) ) );
      appendNode( root, target );
      mountContext( context );
    },

    destroy() {
      destroyContext( context );
      removeNode( root );
      root = null;
    },

    provide( key, value ) {
      withContext( context, () => provide( key, value ) );
    },

    use( callback ) {
      withContext( context, callback );
    },
  };
}

export { inject, onDestroy, onMount, provide };
