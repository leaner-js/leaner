import { useReactive } from 'leaner';
import { isPlainObject } from '../shared/utils.js';

export function setStyles( element, styles ) {
  if ( typeof styles == 'function' ) {
    useReactive( () => {
      const value = styles();
      if ( isPlainObject( value ) ) {
        element.style = '';
        for ( const [ key, value ] of Object.entries( value ) )
          setStyleProperty( element, key, value );
      } else {
        element.style = value;
      }
    } );
  } else if ( isPlainObject( styles ) ) {
    setStylesObject( element, styles );
  } else {
    element.style = styles;
  }
}

function setStylesObject( element, styles ) {
  for ( const [ key, value ] of Object.entries( styles ) ) {
    if ( typeof value == 'function' )
      useReactive( () => element.style[ key ] = value() );
    else
      setStyleProperty( element, key, value );
  }
}

function setStyleProperty( element, key, value ) {
  if ( key.startsWith( '--' ) )
    element.style.setProperty( key, value );
  else
    element.style[ key ] = value;
}
