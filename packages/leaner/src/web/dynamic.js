import { reactive } from 'leaner';
import { createChildContext } from './components.js';
import { DynamicNode } from './nodes.js';
import { updateDynamicNode } from './update.js';

export function createDynamicDirective( template ) {
  if ( template.length < 2 || typeof template[ 1 ] != 'function' )
      throw new TypeError( 'Invalid dynamic template' );

  const [ , type, ...args ] = template;

  const result = new DynamicNode( null );

  const context = createChildContext();

  reactive( type, update );

  return result;

  function update( type ) {
    updateDynamicNode( result, context, [ type, ...args ] );
  }
}
