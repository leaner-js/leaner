import { destroyContext, mountContext, withContext } from './components.js';
import { make } from './make.js';
import { appendNode, removeNode } from './nodes.js';

export { onDestroy, onMount } from './components.js';

export function mount( component, target ) {
  const context = {
    parent: null,
    children: [],
  };

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
