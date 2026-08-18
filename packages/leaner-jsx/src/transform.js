import * as Elements from './elements.js';

export function transform( node, parent, code ) {
  const transformElement = Elements[ `transform${node.type}` ];
  if ( transformElement != null )
    transformElement( node, parent, code );
  else
    transformChildren( node, parent, code );
}

export function transformChildren( node, parent, code ) {
  for ( const key of Object.keys( node ) ) {
    const value = node[ key ];
    if ( Array.isArray( value ) )
      value.forEach( child => child && transform( child, node, code ) );
    else if ( value != null && typeof( value ) == 'object' )
      transform( value, node, code );
  }
}
