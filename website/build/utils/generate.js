import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { join } from 'path/posix';

import { escapeUTF8 } from 'entities';

import { renderMarkdown } from './markdown.js';

export async function generateFile( file, rootDir, template, config ) {
  const source = await readFile( resolve( rootDir, 'docs', file ), 'utf-8' );

  const env = { base: dirname( file ) };
  const content = renderMarkdown( source, env );

  const title = env.frontmatter.title || ( env.title != '' ? `${ env.title } - ${ config.title }` : config.title );
  let meta = `<title>${ escapeUTF8( title ) }</title>`;

  if ( env.frontmatter.meta != null ) {
    for ( const [ key, value ] of Object.entries( env.frontmatter.meta ) )
      meta += `\n  <meta name="${ escapeUTF8( key ) }" content="${ escapeUTF8( value ) }">`;
  }

  const tokens = [
    [ '$META$', meta ],
    [ '$CONTENT$', content ],
  ];

  let result = template;

  for ( const [ key, value ] of tokens )
    result = result.replaceAll( key, value );


  const fileName = join( 'dist', file.replace( /.md$/, '.html' ) );
  const filePath = resolve( rootDir, fileName );

  await mkdir( dirname( filePath ), { recursive: true } );

  await writeFile( filePath, result, 'utf-8' );
}
