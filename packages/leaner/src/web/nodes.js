export class DynamicNode {
  constructor( content ) {
    this.content = content;
    this.parentNode = null;
  }
}

export function appendNode( node, parent ) {
  if ( Array.isArray( node ) ) {
    if ( node.some( item => item instanceof DynamicNode ) ) {
      for ( const item of node ) {
        if ( item instanceof DynamicNode ) {
          item.parentNode = parent;
          appendNode( item.content, parent );
        } else {
          parent.append( item );
        }
      }
    } else {
      parent.append( ...node );
    }
  } else if ( node instanceof DynamicNode ) {
    node.parentNode = parent;
    appendNode( node.content, parent );
  } else {
    parent.append( node );
  }
}

export function insertBefore( node, parent, before ) {
  if ( Array.isArray( node ) ) {
    for ( const item of node ) {
      if ( item instanceof DynamicNode ) {
        item.parentNode = parent;
        insertBefore( item.content, parent, before );
      } else {
        parent.insertBefore( item, before );
      }
    }
  } else if ( node instanceof DynamicNode ) {
    node.parentNode = parent;
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
        item.parentNode = null;
        [ parent, before ] = removeNode( item.content );
      } else {
        parent = item.parentNode;
        before = item.nextSibling;
        parent.removeChild( item );
      }
    }
    return [ parent, before ];
  }

  if ( node instanceof DynamicNode ) {
    node.parentNode = null;
    return removeNode( node.content );
  }

  const parent = node.parentNode;
  const before = node.nextSibling;

  parent.removeChild( node );

  return [ parent, before ];
}

export function replaceNode( newNode, node ) {
  if ( newNode instanceof Node && node instanceof Node ) {
    node.parentNode.replaceChild( newNode, node );
  } else if ( Array.isArray( newNode ) && Array.isArray( node ) ) {
    let newStart = 0, start = 0;
    let newEnd = newNode.length, end = node.length;
    let parent = null, before = null;

    while ( newStart < newEnd || start < end ) {
      // skip equal nodes at the start
      if ( newNode[ newStart ] == node[ start ] ) {
        newStart++;
        start++;
        before = null;
        continue;
      }

      // skip equal nodes at the end
      while ( newNode[ newEnd - 1 ] == node[ end - 1 ] ) {
        newEnd--;
        end--;
      }

      // insert new node
      if ( newStart < newEnd && newNode[ newStart ].parentNode == null ) {
        if ( before == null ) {
          if ( start < end ) {
            before = node[ start ];
            if ( before instanceof DynamicNode )
              before = findFirstChild( before.content );
            parent = before.parentNode;
          } else {
            let after = newNode[ newStart - 1 ];
            if ( after instanceof DynamicNode )
              after = findLastChild( after.content );
            before = after.nextSibling;
            parent = after.parentNode;
          }
        }
        insertBefore( newNode[ newStart ], parent, before );
        newStart++;
        continue;
      }

      // swap nodes
      if ( newNode[ newStart ] == node[ end - 1 ] && newNode[ newEnd - 1 ] == node[ start ] ) {
        let after, before2;
        if ( end - start > 2 ) {
          after = node[ end - 1 ];
          if ( after instanceof DynamicNode )
            after = findLastChild( after.content );
          before2 = after.nextSibling;
        }

        if ( before == null ) {
          before = node[ start ];
          if ( before instanceof DynamicNode )
            before = findFirstChild( before.content );
          parent = before.parentNode;
        }
        insertBefore( node[ end - 1 ], parent, before );

        if ( after != null )
          insertBefore( node[ start ], parent, before2 );

        start++;
        newStart++;
        end--;
        newEnd--;

        continue;
      }

      // remove node
      [ parent, before ] = removeNode( node[ start ] );
      start++;
    }
  } else {
    const [ parent, before ] = removeNode( node );

    insertBefore( newNode, parent, before );
  }
}

function findFirstChild( node ) {
  if ( Array.isArray( node ) ) {
    const item = node[ 0 ];
    if ( item instanceof DynamicNode )
      return findFirstChild( item.content );
    return item;
  }
  if ( node instanceof DynamicNode )
    return findFirstChild( node.content );
  return node;
}

function findLastChild( node ) {
  if ( Array.isArray( node ) ) {
    const item = node[ node.length - 1 ];
    if ( item instanceof DynamicNode )
      return findLastChild( item.content );
    return item;
  }
  if ( node instanceof DynamicNode )
    return findLastChild( node.content );
  return node;
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
