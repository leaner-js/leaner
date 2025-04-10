import { cleanUpContext, createChildContext, handleError } from './components';
import { DynamicNode } from './nodes';
import { updateDynamicNode } from './update';

export function createTryDirective( template ) {
  if ( template.length != 3 || typeof template[ 2 ] != 'function' )
    throw new TypeError( 'Invalid try template' );

  const result = new DynamicNode( null );

  const context = createChildContext();

  try {
    updateDynamicNode( result, context, template[ 1 ] );
  } catch ( err ) {
    updateErrorState( err );
    return result;
  }

  context.errorHandler = asyncErrorHandler;

  return result;

  function asyncErrorHandler( err ) {
    try {
      updateErrorState( err );
    } catch ( err ) {
      handleError( context, err );
    }
  }

  function updateErrorState( err ) {
    context.errorHandler = null;
    if ( result.content == null )
      cleanUpContext( context );
    updateDynamicNode( result, context, template[ 2 ]( err ) );
  }
}
