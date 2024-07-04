/*
 * This code is based on https://github.com/markdown-it/markdown-it-container with additional
 * callback option which makes it possible to extract front matter and hero without rendering it.
 */

export default function containerPlugin( md, name, options ) {
  function validateDefault( params ) {
    return params.trim().split( ' ', 2 )[ 0 ] == name;
  }

  function renderDefault( tokens, idx, options, env, self ) {
    if ( tokens[ idx ].nesting == 1 )
      tokens[ idx ].attrJoin( 'class', name );
    return self.renderToken( tokens, idx, options, env, self );
  }

  options = options || {};

  const minMarkers = 3;
  const markerStr = options.marker || ':';
  const markerChar = markerStr.charCodeAt( 0 );
  const markerLen  = markerStr.length;
  const validate = options.validate || validateDefault;
  const render = options.render || renderDefault;
  const callback = options.callback;

  function container( state, startLine, endLine, silent ) {
    let pos;
    let autoClosed = false;
    let start = state.bMarks[ startLine ] + state.tShift[ startLine ];
    let max = state.eMarks[ startLine ];

    if ( markerChar !== state.src.charCodeAt( start ) )
      return false;

    for ( pos = start + 1; pos <= max; pos++ ) {
      if ( markerStr[ ( pos - start ) % markerLen ] != state.src[ pos ] )
        break;
    }

    const markerCount = Math.floor( ( pos - start ) / markerLen );
    if ( markerCount < minMarkers )
      return false;
    pos -= ( pos - start ) % markerLen;

    const markup = state.src.slice( start, pos );
    const params = state.src.slice( pos, max );
    if ( !validate( params, markup ) )
      return false;

    if ( silent )
      return true;

    const start_content = max + 1;

    let nextLine = startLine;

    while ( true ) {
      nextLine++;
      if ( nextLine >= endLine )
        break;

      start = state.bMarks[ nextLine ] + state.tShift[ nextLine ];
      max = state.eMarks[ nextLine ];

      if ( start < max && state.sCount[ nextLine ] < state.blkIndent )
        break;

      if ( markerChar !== state.src.charCodeAt( start ) )
        continue;

      if ( state.sCount[ nextLine ] - state.blkIndent >= 4 )
        continue;

      for ( pos = start + 1; pos <= max; pos++ ) {
        if ( markerStr[ ( pos - start ) % markerLen ] !== state.src[ pos ] )
          break;
      }

      if ( Math.floor( ( pos - start ) / markerLen ) < markerCount )
        continue;

      pos -= ( pos - start ) % markerLen;
      pos = state.skipSpaces( pos );

      if ( pos < max )
        continue;

      autoClosed = true;
      break;
    }

    const oldParentType = state.parentType;
    const oldLineMax = state.lineMax;
    state.parentType = 'container';

    state.lineMax = nextLine;

    if ( callback ) {
      const token = state.push( `container_${ name }`, null, 0 );
      token.hidden = true;
      token.markup = markup;
      token.block = true;
      token.map = [ startLine, nextLine ];
      token.meta = state.src.slice( start_content, start - 1 );

      callback( token.meta );
    } else {
      const token_o  = state.push( `container_${ name }_open`, 'div', 1 );
      token_o.markup = markup;
      token_o.block  = true;
      token_o.info   = params;
      token_o.map    = [ startLine, nextLine ];

      state.md.block.tokenize( state, startLine + 1, nextLine );

      const token_c  = state.push( `container_${ name }_close`, 'div', -1 );
      token_c.markup = state.src.slice( start, pos );
      token_c.block  = true;
    }

    state.parentType = oldParentType;
    state.lineMax = oldLineMax;
    state.line = nextLine + ( autoClosed ? 1 : 0 );

    return true;
  }

  md.block.ruler.before( 'fence', `container_${ name }`, container, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ],
  } );

  if ( !callback ) {
    md.renderer.rules[ `container_${ name }_open` ] = render;
    md.renderer.rules[ `container_${ name }_close` ] = render;
  }
};
