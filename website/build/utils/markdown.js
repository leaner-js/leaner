import { extname } from 'path';
import { join } from 'path/posix';

import yaml from 'js-yaml';
import markdownit from 'markdown-it';

import container from './markdown-container.js';

const md = createMarkdown();

let currentEnv = null;

export function renderMarkdown( source, env ) {
  currentEnv = env;
  env.title = '';
  env.toc = [];
  env.frontmatter = {};
  return md.render( source, env );
}

export function escapeHtml( text ) {
  return md.utils.escapeHtml( text );
}

function createMarkdown() {
  const md = markdownit();

  md.use( container, 'frontmatter', {
    marker: '-',
    validate() {
      return true;
    },
    callback( content ) {
      currentEnv.frontmatter = yaml.load( content );
    },
  } );

  md.use( container, 'hero', {
    callback( content ) {
      currentEnv.hero = content;
    },
  } );

  md.use( container, 'warning', {
    render: renderWarning,
  } );

  md.renderer.rules.link_open = renderLink;

  md.renderer.rules.heading_open = renderHeading;
  md.renderer.rules.heading_close = renderHeading;

  return md;
}

function renderLink( tokens, idx, options, env, self ) {
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

function renderHeading( tokens, idx, options, env, self ) {
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
        env.toc.push( { text, link: `#${id}` } );
    }
  }
  return self.renderToken( tokens, idx, options );
}

function renderWarning( tokens, idx ) {
  if ( tokens[ idx ].nesting == 1 ) {
    const match = tokens[ idx ].info.trim().match( /^warning\s+(.*)$/ );
    return '<div class="warning"><p class="warning__title">' + md.utils.escapeHtml( match && match[ 1 ] || 'Warning' ) + '</p>\n';
  } else {
    return '</div>\n';
  }
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
