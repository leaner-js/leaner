import { useReactive } from 'leaner';
import { isPlainObject } from '../shared/utils.js';

export function setClasses( element, classes ) {
  if ( typeof classes == 'function' ) {
    useReactive( () => {
      const value = classes();
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
      useReactive( () => {
        if ( value() )
          element.classList.add( key );
        else
          element.classList.remove( key );
      } );
    } else if ( value ) {
      element.classList.add( key );
    }
  }
}

function setClassesArray( element, classes ) {
  for ( const item of classes ) {
    if ( typeof item == 'function' ) {
      let value = '';
      useReactive( () => {
        const newValue = item();
        if ( newValue === value )
          return;
        if ( value === '' )
          element.classList.add( newValue );
        else if ( newValue === '' )
          element.classList.remove( value );
        else
          element.classList.replace( value, newValue );
        value = newValue;
      } );
    } else if ( isPlainObject( item ) ) {
      setClassesObject( element, item );
    } else {
      element.classList.add( item );
    }
  }
}
