export class DynamicNode {
  constructor( content ) {
    this.content = content;
  }
}

export function appendNode( node, target ) {
  if ( Array.isArray( node ) ) {
    if ( node.some( item => item instanceof DynamicNode ) ) {
      for ( const item of node ) {
        if ( item instanceof DynamicNode )
          appendNode( item.content, target );
        else
          target.append( item );
      }
    } else {
      target.append( ...node );
    }
  } else if ( node instanceof DynamicNode ) {
    appendNode( node.content, target );
  } else {
    target.append( node );
  }
}

export function insertBefore( node, parent, before ) {
  if ( Array.isArray( node ) ) {
    for ( const item of node ) {
      if ( item instanceof DynamicNode )
        insertBefore( item.content, parent, before );
      else
        parent.insertBefore( item, before );
    }
  } else if ( node instanceof DynamicNode ) {
    insertBefore( node.content, parent, before )
  } else {
    parent.insertBefore( node, before );
  }
}

export function removeNode( node ) {
  if ( Array.isArray( node ) ) {
    let parent = null, before = null;
    for ( const item of node ) {
      if ( item instanceof DynamicNode ) {
        [ parent, before ] = removeNode( item.content );
      } else {
        parent = item.parentNode;
        before = item.nextSibling;
        parent.removeChild( item );
      }
    }
    return [ parent, before ];
  }

  if ( node instanceof DynamicNode )
    return removeNode( node.content );

  const parent = node.parentNode;
  const before = node.nextSibling;

  parent.removeChild( node );

  return [ parent, before ];
}

export function replaceNode( newNode, node ) {
  if ( newNode instanceof Node && node instanceof Node ) {
    node.parentNode.replaceChild( newNode, node );
  } else {
    const [ parent, before ] = removeNode( node );

    insertBefore( newNode, parent, before );
  }
}

export function ensureNotEmpty( node ) {
  if ( isEmpty( node ) ) {
    const comment = document.createComment( '' );
    if ( Array.isArray( node ) )
      node.push( comment );
    else
      return comment;
  }
  return node;
}

function isEmpty( node ) {
  if ( Array.isArray( node ) ) {
    for ( const item of node ) {
      if ( !isEmpty( item ) )
        return false;
    }
    return true;
  }

  return node == null;
}
