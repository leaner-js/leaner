import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { join } from 'path/posix';

import { escapeHtml, renderMarkdown } from './markdown.js';

export async function generateFile( file, rootDir, template, config ) {
  const source = await readFile( resolve( rootDir, 'docs', file ), 'utf-8' );

  const env = { base: dirname( file ) };
  const content = renderMarkdown( source, env );

  const title = env.frontmatter.title || ( env.title != '' ? `${ env.title } - ${ config.title }` : config.title );
  const meta = renderMeta( env );

  const nav = `<ul>${ config.nav.map( renderItem ).join( '' ) }</ul>`;

  const sidebar = renderSidebar( file, env, config );

  const hero = env.hero;

  const result = template( { title, meta, nav, sidebar, hero, content } );

  const fileName = join( 'dist', file.replace( /.md$/, '.html' ) );
  const filePath = resolve( rootDir, fileName );

  await mkdir( dirname( filePath ), { recursive: true } );

  await writeFile( filePath, result, 'utf-8' );
}

function renderMeta( env ) {
  if ( env.frontmatter.meta == null )
    return null;

  let meta = '';

  for ( const [ key, value ] of Object.entries( env.frontmatter.meta ) )
    meta += `<meta name="${ escapeHtml( key ) }" content="${ escapeHtml( value ) }">`;

  return meta;
}

function renderSidebar( file, env, config ) {
  if ( env.frontmatter.sidebar == null )
    return null;

  const sidebar = config.sidebar[ env.frontmatter.sidebar ];

  let items = '<ul>';

  for ( const item of sidebar.items ) {
    const link = item.link + ( item.link.endsWith( '/' ) ? 'index.html' : '' );
    const current = '/' + file.replace( /.md$/, '.html' );

    if ( link == current ) {
      items += `<li class="is-active"><a href="${ escapeHtml( item.link ) }">${ escapeHtml( item.text ) }</a>`;
      if ( env.toc.length > 0 )
        items += `<ul>${ env.toc.map( renderItem ).join( '' ) }</ul>`
      items += '</li>';
    } else {
      items += renderItem( item );
    }
  }

  items += '</ul>';

  return { ...sidebar, items };
}

function renderItem( item ) {
  return `<li><a href="${ escapeHtml( item.link ) }">${ escapeHtml( item.text ) }</a></li>`;
}
