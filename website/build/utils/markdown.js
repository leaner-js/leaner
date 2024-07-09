import { extname } from 'path';
import { join } from 'path/posix';

import Shiki from '@shikijs/markdown-it'
import yaml from 'js-yaml';
import markdownit from 'markdown-it';

import container from './markdown-container.js';

const md = await createMarkdown();

let currentEnv = null;

const AlertRegExp = /^(info|tip|warning|danger)(\s+.*)?$/;

export function renderMarkdown( source, env ) {
  currentEnv = env;
  env.title = '';
  env.toc = [];
  env.frontmatter = {};
  env.links = [];
  return md.render( source, env );
}

export function escapeHtml( text ) {
  return md.utils.escapeHtml( text );
}

async function createMarkdown() {
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

  md.use( container, 'alert', {
    validate( params ) {
      return params.trim().match( AlertRegExp );
    },
    render: renderAlert,
  } );

  md.use( await Shiki( {
    themes: {
      light: 'light-plus',
      dark: 'dark-plus',
    },
    defaultColor: false,
  } ) );

  md.renderer.rules.link_open = renderLink;

  md.renderer.rules.heading_open = renderHeading;
  md.renderer.rules.heading_close = renderHeading;

  return md;
}

function renderLink( tokens, idx, options, env, self ) {
  const href = tokens[ idx ].attrGet( 'href' );
  if ( href.startsWith( './' ) || href.startsWith( '../' ) ) {
    const parts = href.split( '#' );
    if ( !parts[ 0 ].endsWith( '/' ) ) {
      const extension = extname( parts[ 0 ] );
      if ( extension == '' )
        parts[ 0 ] += '.html';
      else if ( extension == '.md' )
        parts[ 0 ] = parts[ 0 ].replace( /.md$/, '.html' );
    }
    parts[ 0 ] = '/' + join( env.base, parts[ 0 ] );
    tokens[ idx ].attrSet( 'href', parts.join( '#' ) );
    if ( env.links != null )
      env.links.push( parts[ 0 ] );
  } else {
    tokens[ idx ].attrSet( 'target', '_blank' );
    tokens[ idx ].attrSet( 'rel', 'noopener noreferrer' );
  }
  return self.renderToken( tokens, idx, options );
}

function renderHeading( tokens, idx, options, env, self ) {
  const open = tokens[ idx ].type == 'heading_open';

  const level = Number( tokens[ idx ].tag.substring( 1 ) );
  tokens[ idx ].tag = `h${ level + 1 }`;

  const text = getRawText( tokens[ idx + ( open ? 1 : -1 ) ].children );
  const id = slugify( text );

  if ( open ) {
    if ( level == 1 ) {
      env.title = text;
    } else {
      tokens[ idx ].attrSet( 'id', id );
      if ( level == 2 )
        env.toc.push( { text, link: `#${id}` } );
    }
  } else {
    if ( level > 1 ) {
      const anchor = ` <a href="#${ id }" class="anchor" aria-label="Permalink to ${ escapeHtml( text ) }"><i class="i i-link"></i></a>`;
      return anchor + self.renderToken( tokens, idx, options );
    }
  }

  return self.renderToken( tokens, idx, options );
}

function renderAlert( tokens, idx ) {
  if ( tokens[ idx ].nesting == 1 ) {
    const match = tokens[ idx ].info.trim().match( AlertRegExp );
    return `<div class="alert is-${ match[ 1 ] }"><p class="alert__title">${ md.utils.escapeHtml( match[ 2 ] || match[ 1 ].toUpperCase() ) }</p>\n`;
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
