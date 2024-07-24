import { reactive } from 'leaner';
import { isPlainObject } from '../shared/utils.js';

export function setClasses( element, classes ) {
  if ( typeof classes == 'function' ) {
    reactive( classes, value => {
      if ( Array.isArray( value ) ) {
        element.className = '';
        element.classList.add( ...value );
      } else {
        element.className = value;
      }
    } );
  } else if ( isPlainObject( classes ) ) {
    setClassesObject( element, classes );
  } else if ( Array.isArray( classes ) ) {
    setClassesArray( element, classes );
  } else {
    element.className = classes;
  }
}

function setClassesObject( element, classes ) {
  for ( const [ key, value ] of Object.entries( classes ) ) {
    if ( typeof value == 'function' ) {
      reactive( value, ( newValue, value ) => {
        if ( newValue ) {
          if ( !value )
            element.classList.add( key );
        } else {
          if ( value )
            element.classList.remove( key );
        }
      } );
    } else if ( value ) {
      element.classList.add( key );
    }
  }
}

function setClassesArray( element, classes ) {
  for ( const item of classes ) {
    if ( typeof item == 'function' ) {
      reactive( item, ( newValue, value ) => {
        if ( newValue ) {
          if ( value )
            element.classList.replace( value, newValue );
          else
            element.classList.add( newValue );
        } else {
          if ( value )
            element.classList.remove( value );
        }
      } );
    } else if ( isPlainObject( item ) ) {
      setClassesObject( element, item );
    } else {
      element.classList.add( item );
    }
  }
}
