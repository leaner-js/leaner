import { destroyContext, mountContext, withContext } from './components.js';
import { make } from './make.js';
import { ensureNotEmpty, replaceNode } from './nodes.js';

export function updateDynamicNode( node, context, template ) {
  let content = null;

  if ( node.content != null )
    destroyContext( context );

  if ( template != null )
    content = withContext( context, () => make( template ) );

  content = ensureNotEmpty( content );

  if ( node.content != null ) {
    replaceNode( content, node.content );
    mountContext( context );
  }

  node.content = content;
}
