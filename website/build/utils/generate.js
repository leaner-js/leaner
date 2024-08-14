import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { join } from 'path/posix';

import { escapeHtml, renderMarkdown } from './markdown.js';

export async function generateFile( file, rootDir, template, config, version, files ) {
  let source = await readFile( resolve( rootDir, 'docs', file ), 'utf-8' );

  source = source.replaceAll( '$VERSION$', version );

  const env = { base: dirname( file ) };
  const content = renderMarkdown( source, env );

  const title = env.frontmatter.title || ( env.title != '' ? `${ env.title } - ${ config.title }` : config.title );
  const meta = renderMeta( env );

  const nav = `<ul>${ config.nav.map( renderItem ).join( '' ) }</ul>`;

  const sidebar = renderSidebar( file, env, config );

  const result = template( { title, meta, nav, sidebar, hero: env.hero, pager: sidebar?.pager, content } );

  await writeResult( file, rootDir, result );

  handleDeadLinks( env.links, files, file );
}

export async function generate404( file, rootDir, template, config ) {
  const content = '<h2>Page not found</h2>'
    + '<p>We are sorry, there is no content at this location. Return to the <a href="/">home page</a>.</p>';

  const title = `Page not found - ${ config.title }`;

  const nav = `<ul>${ config.nav.map( renderItem ).join( '' ) }</ul>`;

  const result = template( { title, nav, content } );

  await writeResult( file, rootDir, result );
}

async function writeResult( file, rootDir, result ) {
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
  let pager = null;

  for ( let i = 0; i < sidebar.items.length; i++ ) {
    const item = sidebar.items[ i ];
    const link = item.link + ( item.link.endsWith( '/' ) ? 'index.html' : '' );
    const current = '/' + file.replace( /.md$/, '.html' );

    if ( link == current ) {
      items += `<li class="is-active"><a href="${ escapeHtml( item.link ) }">${ escapeHtml( item.text ) }</a>`;
      if ( env.toc.length > 0 )
        items += `<ul>${ env.toc.map( renderItem ).join( '' ) }</ul>`
      items += '</li>';
      if ( i > 0 || i < sidebar.items.length - 1 )
        pager = { prev: sidebar.items[ i - 1 ], next: sidebar.items[ i + 1 ] };
    } else {
      items += renderItem( item );
    }
  }

  items += '</ul>';

  return { ...sidebar, items, pager };
}

function renderItem( item ) {
  return `<li><a href="${ escapeHtml( item.link ) }">${ escapeHtml( item.text ) }</a></li>`;
}

function handleDeadLinks( links, files, file ) {
  for ( let url of links ) {
    url = url.replace( /^\//, '' ).replace( /\.html$/, '' );
    if ( url.endsWith( '/' ) )
      url += 'index';
    if ( !files.includes( url + '.md' ) )
      console.warn( `Warning: found dead link /${ url }.html in file ${ file }` );
  }
}
