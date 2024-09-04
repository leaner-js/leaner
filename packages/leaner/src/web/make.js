import { reactive } from 'leaner';
import { appendToArray, isPlainObject } from '../shared/utils.js';
import { setClasses } from './classes.js';
import { createComponent, createRef, withChildContext } from './components.js';
import { createDynamicDirective } from './dynamic.js';
import { createForDirective } from './for.js';
import { createIfDirective } from './if.js';
import { DynamicNode, appendNode } from './nodes.js';
import { setStyles } from './styles.js';

const Directives = {
  if: createIfDirective,
  for: createForDirective,
  dynamic: createDynamicDirective,
};

const Properties = new Set( [ 'value', 'checked', 'textContent', 'innerHTML' ] );

const BooleanAttributes = new Set( [
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer', 'disabled', 'formnovalidate', 'hidden',
  'inert', 'ismap', 'itemscope', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly',
  'required', 'reversed', 'seamless', 'scoped', 'selected',
] );

export function make( template ) {
  if ( template == null )
    return [];

  if ( Array.isArray( template ) ) {
    if ( template.length == 0 )
      return [];

    if ( template.length == 1 && Array.isArray( template[ 0 ] ) ) {
      const result = [];
      for ( const item of template[ 0 ] )
        appendToArray( make( item ), result );
      return result;
    }

    if ( typeof template[ 0 ] == 'string' ) {
      const tag = template[ 0 ];

      if ( Directives.hasOwnProperty( tag ) )
        return Directives[ tag ]( template );

      const element = document.createElement( tag );

      let i = 1;
      if ( i < template.length && isPlainObject( template[ i ] ) )
        setElementProperties( element, template[ i++ ] );

      for ( ; i < template.length; i++ )
        appendNode( make( template[ i ] ), element );

      return element;
    }

    if ( typeof template[ 0 ] == 'function' )
      return withChildContext( () => make( createComponent( template ) ) );

    throw new TypeError( 'Unexpected value passed to make()' );
  }

  if ( typeof template == 'function' ) {
    const textNode = document.createTextNode( '' );
    reactive( template, value => textNode.textContent = value );
    return textNode;
  }

  if ( template instanceof Node || template instanceof DynamicNode )
    return template;

  return document.createTextNode( template );
}

function setElementProperties( element, properties ) {
  for ( const [ key, value ] of Object.entries( properties ) ) {
    switch ( key ) {
      case 'class':
        setClasses( element, value );
        break;
      case 'style':
        setStyles( element, value );
        break;
      case 'ref':
        createRef( value, element );
        break;
      default:
        setElementProperty( element, key, value );
        break;
    }
  }
}

function setElementProperty( element, key, value ) {
  if ( key.startsWith( 'on' ) ) {
    element.addEventListener( key.substring( 2 ), value );
  } else if ( Properties.has( key ) ) {
    if ( typeof value == 'function' )
      reactive( value, value => element[ key ] = value );
    else
      element[ key ] = value;
  } else {
    if ( typeof value == 'function' )
      reactive( value, value => setElementAttribute( element, key, value ) );
    else
      setElementAttribute( element, key, value );
  }
}

function setElementAttribute( element, name, value ) {
  if ( BooleanAttributes.has( name ) ) {
    if ( value || value === '' )
      element.setAttribute( name, '' );
    else
      element.removeAttribute( name );
  } else {
    if ( value != null )
      element.setAttribute( name, value );
    else
      element.removeAttribute( name );
  }
}
