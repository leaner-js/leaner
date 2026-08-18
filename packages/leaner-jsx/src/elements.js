import { Attributes, Directives } from './directives.js';
import { decodeEntities } from './entities.js';
import { transformChildren } from './transform.js';
import { containsNewLine, fixupWhitespaceAndDecodeEntities, getElementName, isEmptyNode, quoteString, raise } from './utils.js';

export function transformJSXElement( node, parent, code ) {
  transformChildren( node, parent, code );

  const children = node.children.filter( isEmptyNode );

  const name = getElementName( node );

  const validateDirective = Directives[ name ];

  if ( validateDirective != null )
    validateDirective( node, name, parent, children, code );

  let pos = node.openingElement.end;

  for ( let i = 0; i < children.length; i++ ) {
    const child = children[ i ];

    if ( containsNewLine( node.children[ node.children.indexOf( child ) - 1 ] ) )
      code.appendLeft( pos, ',' );
    else
      code.appendLeft( pos, ', ' );

    if ( child.type == 'JSXText' )
        code.overwrite( child.start, child.end, quoteString( child.value ) );

    pos = child.end;
  }

  if ( !node.openingElement.selfClosing && !containsNewLine( node.children[ node.children.length - 1 ] ) )
    code.prependRight( node.closingElement.start, ' ' );
}

export function transformJSXFragment( node, parent, code ) {
  transformChildren( node, parent, code );

  if ( !containsNewLine( node.children[ 0 ] ) )
    code.appendLeft( node.openingFragment.end, ' ' );

  const children = node.children.filter( isEmptyNode );

  let pos = node.openingFragment.end;

  for ( let i = 0; i < children.length; i++ ) {
    const child = children[ i ];

    if ( i > 0 ) {
      if ( containsNewLine( node.children[ node.children.indexOf( child ) - 1 ] ) )
        code.appendLeft( pos, ',' );
      else
        code.appendLeft( pos, ', ' );
    }

    if ( child.type == 'JSXText' )
        code.overwrite( child.start, child.end, quoteString( child.value ) );

    pos = child.end;
  }

  if ( !containsNewLine( node.children[ node.children.length - 1 ] ) )
    code.prependRight( node.closingFragment.start, ' ' );
}

export function transformJSXOpeningElement( node, parent, code ) {
  transformChildren( node, parent, code );

  code.overwrite( node.start, node.name.start, '[ ' );

  const isTag = node.name.type == 'JSXIdentifier' && /[a-z]/.test( node.name.name[ 0 ] );

  if ( isTag ) {
    code.prependRight( node.name.start, `'` );
    code.appendLeft( node.name.end, `'` );
  }

  let pos = node.name.end;

  const transformAttributes = isTag ? Attributes[ node.name.name ] : null;

  if ( transformAttributes != null ) {
    transformAttributes( node, parent, code );

    if ( node.attributes.length > 0 )
      pos = node.attributes[ node.attributes.length - 1 ].end;
  } else if ( node.attributes.length == 1 && node.attributes[ 0 ].type == 'JSXSpreadAttribute' ) {
    code.appendLeft( node.name.end, ', ' );
    if ( node.attributes[ 0 ].argument.type == 'SequenceExpression' )
      code.overwrite( pos, node.attributes[ 0 ].argument.start, '( ' );
    else
      code.remove( pos, node.attributes[ 0 ].argument.start );
    pos = node.attributes[ 0 ].end;
  } else if ( node.attributes.length > 0 ) {
    code.appendLeft( node.name.end, ', { ' );

    for ( let i = 0; i < node.attributes.length; i++ ) {
      const attr = node.attributes[ i ];

      if ( i > 0 ) {
        if ( attr.start == pos )
          code.prependRight( pos, ', ' );
        else
          code.overwrite( pos, attr.start, ', ' );
      } else {
        if ( attr.start != pos )
          code.remove( pos, attr.start );
      }

      pos = attr.end;
    }

    code.appendLeft( pos, ' }' );
  }

  if ( node.selfClosing )
    code.overwrite( pos, node.end, ' ]' );
  else
    code.remove( pos, node.end );
}

export function transformJSXClosingElement( node, parent, code ) {
  code.overwrite( node.start, node.end, ']' );
}

export function transformJSXOpeningFragment( node, parent, code ) {
  code.overwrite( node.start, node.end, '[[' );
}

export function transformJSXClosingFragment( node, parent, code ) {
  code.overwrite( node.start, node.end, ']]' );
}

export function transformJSXAttribute( node, parent, code ) {
  transformChildren( node, parent, code );

  const name = node.name.type == 'JSXIdentifier' ? node.name.name : null;

  if ( node.value != null && node.value.type == 'JSXExpressionContainer' && node.value.expression.type == 'Identifier' && node.value.expression.name == name ) {
    code.remove( node.name.start, node.value.start );
  } else {
    if ( name != null && name.includes( '-' ) ) {
      code.prependRight( node.name.start, `'` );
      code.appendLeft( node.name.end, `'` );
    }

    if ( node.value != null )
      code.overwrite( node.name.end, node.value.start, ': ' );
    else
      code.appendLeft( node.name.end, ': true' );

    if ( node.value != null && node.value.type == 'Literal' ) {
      const quoted = quoteString( decodeEntities( node.value.value ) );
      if ( quoted != node.value.raw )
        code.overwrite( node.value.start, node.value.end, quoted );
    }
  }
}

export function transformJSXSpreadAttribute( node, parent, code ) {
  if ( node.argument.type == 'SequenceExpression' ) {
    code.overwrite( node.start, node.argument.start, '...( ' );
    code.overwrite( node.argument.end, node.end, ' )' );
  } else {
    code.overwrite( node.start, node.argument.start, '...' );
    code.remove( node.argument.end, node.end );
  }

  transformChildren( node, parent, code );
}

export function transformJSXExpressionContainer( node, parent, code ) {
  if ( node.expression.type == 'SequenceExpression' ) {
    code.overwrite( node.start, node.expression.start, '( ' );
    code.overwrite( node.expression.end, node.end, ' )' );
  } else {
    code.remove( node.start, node.expression.start );
    code.remove( node.expression.end, node.end );
  }

  transformChildren( node, parent, code );
}

export function transformJSXSpreadChild( node, parent, code ) {
  if ( node.expression.type == 'SequenceExpression' ) {
    code.overwrite( node.start, node.expression.start, '...( ' );
    code.overwrite( node.expression.end, node.end, ' )' );
  } else {
    code.overwrite( node.start, node.expression.start, '...' );
    code.remove( node.expression.end, node.end );
  }

  transformChildren( node, parent, code );
}

export function transformJSXText( node ) {
  node.value = fixupWhitespaceAndDecodeEntities( node.value );
}

export function transformJSXNamespacedName( node, parent, code ) {
  raise( node, code, 'JSX namespaces are not supported' );
}
