import { cleanUpContext, createChildContext, handleError } from './components';
import { DynamicNode } from './nodes';
import { updateDynamicNode } from './update';

export function createTryDirective( template ) {
  const catchTemplate = template[ template.length - 1 ];

  if ( !Array.isArray( catchTemplate ) || catchTemplate.length != 2 || catchTemplate[ 0 ] != 'catch' || typeof catchTemplate[ 1 ] != 'function' )
    throw new TypeError( 'Invalid try template' );

  const result = new DynamicNode( null );

  const context = createChildContext();

  let childTemplate = null;
  if ( template.length == 3 )
    childTemplate = template[ 1 ];
  else
    childTemplate = [ template.slice( 1, template.length - 1 ) ];

  try {
    updateDynamicNode( result, context, childTemplate );
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
    updateDynamicNode( result, context, catchTemplate[ 1 ]( err ) );
  }
}
