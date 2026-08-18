import { decodeEntities } from './entities.js';

const EscapedCharsRegExp = /[\\'\u0000-\u001f\u2028\u2029\u0085]/g;

const EscapedCharsMap = new Map( Object.entries( {
  '\t': '\\t',
  '\v': '\\v',
  '\f': '\\f',
  '\b': '\\b',
  '\r': '\\r',
  '\n': '\\n',
  '\\': '\\\\',
  '\'': '\\\'',
} ) );

export function quoteString( text ) {
  const escaped = text.replace( EscapedCharsRegExp, ( char, offset ) => {
    if ( char.charCodeAt( 0 ) == 0 ) {
      const nextCode = text.charCodeAt( offset + char.length );
      if ( nextCode >= 48 && nextCode <= 57 ) // '0' - '9'
        return '\\x00';
      return '\\0';
    }
    return EscapedCharsMap.get( char ) || encodeUtf16EscapeSequence( char.charCodeAt( 0 ) );
  } );
  return `'${escaped}'`;
}

function encodeUtf16EscapeSequence( code ) {
    const hexCode = code.toString( 16 ).toUpperCase();
    const paddedHexCode = ( '0000' + hexCode ).slice( -4 );
    return '\\u' + paddedHexCode;
}

// based on the TypeScript JSX transformer
export function fixupWhitespaceAndDecodeEntities( text ) {
  let result = null;

  let firstNonWhitespace = 0;
  let lastNonWhitespace = -1;

  for ( let i = 0; i < text.length; i++ ) {
    const code = text.charCodeAt( i );
    if ( isNewLine( code ) ) {
      if ( firstNonWhitespace != -1 && lastNonWhitespace != -1 )
        result = addLineOfJsxText( result, text.substr( firstNonWhitespace, lastNonWhitespace - firstNonWhitespace + 1 ) );
      firstNonWhitespace = -1;
    } else if ( !isWhiteSpaceSingleLine( code ) ) {
      lastNonWhitespace = i;
      if ( firstNonWhitespace == -1 )
        firstNonWhitespace = i;
    }
  }

  if ( firstNonWhitespace != -1 )
    return addLineOfJsxText( result, text.substr( firstNonWhitespace ) );

  return result;
}

function isNewLine( code ) {
  return code == 10 || code == 13 || code == 0x2028 || code == 0x2029;
}

function isWhiteSpaceSingleLine( code ) {
  return code == 32 || code == 9 || code == 11 || code == 12 || code == 160 || code == 0x1680 || code >= 0x2000 && code <= 0x200A
    || code == 0x202F || code == 0x205F || code == 0x3000 || code == 0xFEFF;
}

function addLineOfJsxText( result, text ) {
  const decoded = decodeEntities( text );
  return result != null ? `${result} ${decoded}` : decoded;
}

export function getElementName( node ) {
  if ( node.type == 'JSXElement' && node.openingElement.name.type == 'JSXIdentifier' )
    return node.openingElement.name.name;
  return null;
}

export function isEmptyNode( node ) {
  if ( node.type == 'JSXExpressionContainer' && node.expression.type == 'JSXEmptyExpression' )
    return false;
  if ( node.type == 'JSXText' && node.value == null )
    return false;
  return true;
}

export function containsNewLine( node ) {
  return node != null && node.type == 'JSXText' && node.value == null;
}

export function raise( node, code, message ) {
  const loc = getLineInfo( code.original, node.start );
  message += ` (${loc.line}:${loc.column})`;
  const err = new SyntaxError( message );
  err.pos = node.start;
  err.loc = loc;
  throw err;
}

function getLineInfo( input, offset ) {
  for ( let line = 1, cur = 0; ; ) {
    const nextBreak = nextLineBreak( input, cur, offset );
    if ( nextBreak < 0 )
      return { line, column: offset - cur + 1 };
    line++;
    cur = nextBreak;
  }
}

function nextLineBreak( code, from, end ) {
  for ( let i = from; i < end; i++ ) {
    const next = code.charCodeAt( i )
    if ( isNewLine( next ) )
      return i < end - 1 && next == 13 && code.charCodeAt( i + 1 ) == 10 ? i + 2 : i + 1;
  }
  return -1;
}
