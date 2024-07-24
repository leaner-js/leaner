import { reactive } from 'leaner';
import { createChildContext } from './components.js';
import { DynamicNode } from './nodes.js';
import { updateDynamicNode } from './update.js';

export function createIfDirective( template ) {
  let numberOfConditions = 0;
  let hasElse = false;

  for ( let i = 1; i < template.length; i += 2 ) {
    if ( i == template.length - 1 )
      hasElse = true;
    else if ( typeof template[ i ] == 'function' )
      numberOfConditions++;
    else
      throw new TypeError( 'Invalid if template' );
  }

  if ( numberOfConditions == 0 )
      throw new TypeError( 'Invalid if template' );

  const result = new DynamicNode( null );

  const context = createChildContext();

  reactive( watchState, update );

  return result;

  function watchState() {
    let state = null;

    for ( let i = 0; i < numberOfConditions; i++ ) {
      if ( template[ 2 * i + 1 ]() ) {
        state = 2 * i + 2;
        break;
      }
    }

    if ( state == null && hasElse )
      state = template.length - 1;

    return state;
  }

  function update( state ) {
    updateDynamicNode( result, context, state != null ? template[ state ] : null );
  }
}
