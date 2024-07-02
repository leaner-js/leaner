import { extname } from 'path';
import { join } from 'path/posix';

import yaml from 'js-yaml';
import markdownit from 'markdown-it';
import container from 'markdown-it-container';
import frontmatter from 'markdown-it-front-matter';

let currentEnv = null;

const md = markdownit();

md.use( frontmatter, fm => {
  currentEnv.frontmatter = yaml.load( fm );
} );

md.use( container, 'warning' );

md.renderer.rules.link_open = handleLink;

md.renderer.rules.heading_open = handleHeading;
md.renderer.rules.heading_close = handleHeading;

export function renderMarkdown( source, env ) {
  currentEnv = env;
  env.title = '';
  env.toc = [];
  env.frontmatter = {};
  return md.render( source, env );
}

function handleLink( tokens, idx, options, env, self ) {
  const href = tokens[ idx ].attrGet( 'href' );
  if ( href.startsWith( './' ) || href.startsWith( '../' ) ) {
    const parts = href.split( '#' );
    const extension = extname( parts[ 0 ] );
    if ( extension == '' )
      parts[ 0 ] += '.html';
    else if ( extension == '.md' )
      parts[ 0 ] = parts[ 0 ].replace( /.md$/, '.html' );
    parts[ 0 ] = '/' + join( env.base, parts[ 0 ] );
    tokens[ idx ].attrSet( 'href', parts.join( '#' ) );
  } else {
    tokens[ idx ].attrSet( 'target', '_blank' );
    tokens[ idx ].attrSet( 'rel', 'noopener noreferrer' );
  }
  return self.renderToken( tokens, idx, options );
}

function handleHeading( tokens, idx, options, env, self ) {
  const level = Number( tokens[ idx ].tag.substring( 1 ) );
  tokens[ idx ].tag = `h${ level + 1 }`;
  if ( tokens[ idx ].type == 'heading_open' ) {
    const text = getRawText( tokens[ idx + 1 ].children );
    if ( level == 1 ) {
      env.title = text;
    } else {
      const id = slugify( text );
      tokens[ idx ].attrSet( 'id', id );
      if ( level == 2 )
        env.toc.push( { id, text } );
    }
  }
  return self.renderToken( tokens, idx, options );
}

function getRawText( tokens ) {
  let text = '';

  for ( const token of tokens ) {
    switch ( token.type ) {
      case 'text':
      case 'code_inline':
        text += token.content;
        break;
      case 'softbreak':
      case 'hardbreak':
        text += ' ';
        break;
    }
  }

  return text;
}

function slugify( text ) {
  return encodeURIComponent( text.trim().toLowerCase().replace( /\s+/g, '-' ) );
}
