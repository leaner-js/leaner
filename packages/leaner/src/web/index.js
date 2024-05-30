import { createContext, destroyContext, mountContext, onDestroy, onMount, withContext } from './components.js';
import { make } from './make.js';
import { appendNode, removeNode } from './nodes.js';

export function mount( component, target ) {
  const context = createContext( null );

  const root = withContext( context, () => make( component( {}, [] ) ) );

  appendNode( root, target );

  mountContext( context );

  return {
    destroy,
  };

  function destroy() {
    destroyContext( context );
    removeNode( root );
  }
}

export { onDestroy, onMount };
