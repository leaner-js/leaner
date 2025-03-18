import { reactive } from 'leaner';
import { createChildContext } from './components.js';
import { DynamicNode } from './nodes.js';
import { updateDynamicNode } from './update.js';

export function createIfDirective( template ) {
  if ( template.length < 2 || typeof template[ 1 ] != 'function' )
    throw new TypeError( 'Invalid if template' );

  const result = new DynamicNode( null );

  const context = createChildContext();

  reactive( watchState, update );

  return result;

  function watchState() {
    return template[ 1 ]();
  }

  function update( state ) {
    let childTemplate = null;
    if ( state ) {
      if ( template.length == 3 )
        childTemplate = template[ 2 ];
      else
        childTemplate = [ template.slice( 2 ) ];
    }
    updateDynamicNode( result, context, childTemplate );
  }
}
