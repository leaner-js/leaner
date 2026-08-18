import { getElementName, raise } from './utils.js';

export const Directives = {
  catch: validateCatchDirective,
  else: validateParentElement,
  for: validateChildExpression,
  repeat: validateChildExpression,
  switch: validateSwitchDirective,
};

export const Attributes = {
  catch: transformNoAttributes,
  dynamic: transformDynamicAttributes,
  else: transformNoAttributes,
  for: transformSingleAttribute,
  if: transformSingleAttribute,
  repeat: transformSingleAttribute,
  switch: transformNoAttributes,
  try: transformNoAttributes,
};

const ParentNames = {
  else: 'switch',
  catch: 'try',
};

const SingleAttributeNames = {
  for: 'items',
  if: 'match',
  repeat: 'count',
};

function validateParentElement( node, name, parent, children, code ) {
  if ( parent != null && parent.type == 'JSXElement' && getElementName( parent ) != ParentNames[ name ] )
    raise( node, code, `Unexpected ${name} directive` );
}

function validateChildExpression( node, name, parent, children, code ) {
  if ( children.length != 1 || children[ 0 ].type != 'JSXExpressionContainer' )
    raise( node, code, `Invalid children in ${name} directive` );
}

function validateCatchDirective( node, name, parent, children, code ) {
  validateParentElement( node, name, parent, children, code );
  validateChildExpression( node, name, parent, children, code );
}

function validateSwitchDirective( node, name, parent, children, code ) {
  for ( let i = 0; i < children.length; i++ ) {
    const child = children[ i ];

    if ( child.type != 'JSXExpressionContainer' && ( child.type != 'JSXElement' || getElementName( child ) != 'if' && getElementName( child ) != 'else' ) )
      raise( child, code, `Invalid children in switch directive` );
  }
}

function transformNoAttributes( node, parent, code ) {
  if ( node.attributes.length != 0 )
    raise( node, code, `Invalid attributes in ${node.name.name} directive` );
}

function transformSingleAttribute( node, parent, code ) {
  const name = SingleAttributeNames[ node.name.name ];

  if ( node.attributes.length != 1 || node.attributes[ 0 ].type != 'JSXAttribute' || node.attributes[ 0 ].name.name != name || node.attributes[ 0 ].value == null )
    raise( node, code, `Invalid attributes in ${node.name.name} directive` );

  const items = node.attributes[ 0 ];

  if ( items.start == node.name.end )
    code.prependRight( node.name.end, ', ' );
  else
    code.overwrite( node.name.end, items.start, ', ' );

  code.remove( items.name.start, items.value.start );
}

function transformDynamicAttributes( node, parent, code ) {
  let pos = node.name.end;
  let cnt = 0;

  const is = node.attributes.find( a => a.type == 'JSXAttribute' && a.name.name == 'is' );

  if ( is == null || is.value == null )
    raise( node, code, 'Invalid attributes in dynamic directive' );

  code.appendLeft( node.name.end, ', ' );
  code.move( is.value.start, is.value.end, node.name.end );

  const spreadOnly = node.attributes.length == 2 && node.attributes.some( a => a.type == 'JSXSpreadAttribute' );

  for ( let i = 0; i < node.attributes.length; i++ ) {
    const attr = node.attributes[ i ];

    if ( attr == is ) {
      if ( attr.start != pos )
        code.remove( pos, attr.start );
      code.remove( attr.name.start, attr.value.start );
    } else {
      if ( spreadOnly )
        code.remove( pos, attr.argument.start );

      if ( cnt > 0 ) {
        if ( attr.start == pos )
          code.prependRight( pos, ', ' );
        else
          code.overwrite( pos, attr.start, ', ' );
      } else {
        if ( attr.start != pos )
          code.remove( pos, attr.start );
        if ( !spreadOnly )
          code.appendLeft( attr.start, ', { ' );
        else if ( attr.argument.type == 'SequenceExpression' )
          code.appendLeft( attr.start, ', ( ' );
        else
          code.appendLeft( attr.start, ', ' );
      }

      cnt++;
    }

    pos = attr.end;
  }

  if ( cnt > 0 && !spreadOnly )
    code.appendLeft( pos, ' }' );
}
