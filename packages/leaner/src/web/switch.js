import { reactive } from 'leaner';
import { createChildContext } from './components.js';
import { DynamicNode } from './nodes.js';
import { updateDynamicNode } from './update.js';

export function createSwitchDirective( template ) {
  let numberOfConditions = 0;
  let hasElse = false;

  for ( let i = 1; i < template.length; i++ ) {
    const condition = template[ i ];
    if ( Array.isArray( condition ) && condition.length > 1 && condition[ 0 ] === 'if' && typeof condition[ 1 ] == 'function' )
      numberOfConditions++;
    else if ( i == template.length - 1 && Array.isArray( condition ) && condition.length > 0 && condition[ 0 ] === 'else' )
      hasElse = true;
    else
      throw new TypeError( 'Invalid switch template' );
  }

  if ( numberOfConditions == 0 )
    throw new TypeError( 'Invalid switch template' );

  const result = new DynamicNode( null );

  const context = createChildContext();

  reactive( watchState, update );

  return result;

  function watchState() {
    let state = null;

    for ( let i = 0; i < numberOfConditions; i++ ) {
      if ( template[ i + 1 ][ 1 ]() ) {
        state = i + 1;
        break;
      }
    }

    if ( state == null && hasElse )
      state = template.length - 1;

    return state;
  }

  function update( state ) {
    let childTemplate = null;
    if ( state != null ) {
      const condition = template[ state ];
      const index = condition[ 0 ] == 'else' ? 1 : 2;
      if ( condition.length == index + 1 )
        childTemplate = condition[ index ];
      else
        childTemplate = [ condition.slice( index ) ];
    }
    updateDynamicNode( result, context, childTemplate );
  }
}
