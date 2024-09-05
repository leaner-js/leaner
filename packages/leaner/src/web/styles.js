import { reactive } from 'leaner';
import { isPlainObject } from '../shared/utils.js';

export function setStyles( element, styles ) {
  if ( typeof styles == 'function' ) {
    reactive( styles, value => {
      if ( isPlainObject( value ) ) {
        element.style = '';
        for ( const [ key, value ] of Object.entries( value ) )
          setStyleProperty( element, key, value );
      } else if ( value != null ) {
        element.style = value;
      } else {
        element.removeAttribute( 'style' );
      }
    } );
  } else if ( isPlainObject( styles ) ) {
    setStylesObject( element, styles );
  } else if ( styles != null ) {
    element.style = styles;
  }
}

function setStylesObject( element, styles ) {
  for ( const [ key, value ] of Object.entries( styles ) ) {
    if ( typeof value == 'function' )
      reactive( value, value => setStyleProperty( element, key, value ) );
    else
      setStyleProperty( element, key, value );
  }
}

function setStyleProperty( element, key, value ) {
  if ( value == null )
    value = '';
  if ( key.startsWith( '--' ) )
    element.style.setProperty( key, value );
  else
    element.style[ key ] = value;
}
