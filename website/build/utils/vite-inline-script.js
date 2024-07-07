import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { transformWithEsbuild } from 'vite';

const scriptRegExp = /<script([^>]*)>/gi;
const typeRegExp = /\btype\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i;
const srcRegExp = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i;

export function inlineScript() {
  let rootDir = null;
  return {
    name: 'inline-script',
    configResolved( config ) {
      rootDir = config.root;
    },
    transformIndexHtml: {
      order: 'pre',
      async handler( source, ctx ) {
        const result = [];
        let prevPos = 0;
        const matches = source.matchAll( scriptRegExp );
        for ( const match of matches ) {
          const attrs = match[ 1 ];
          const typeMatch  = attrs.match( typeRegExp  );
          const type = typeMatch && ( typeMatch[ 1 ] || typeMatch[ 2 ] || typeMatch[ 3 ] );
          if ( type == 'inline' ) {
            const srcMatch  = attrs.match( srcRegExp  );
            const src = srcMatch && ( srcMatch[ 1 ] || srcMatch[ 2 ] || srcMatch[ 3 ] );
            if ( src != null ) {
              const content = await readFile( resolve( rootDir, src ), 'utf-8' );
              const minified = await transformWithEsbuild( content, src, { format: 'iife', minify: true } );
              if ( match.index != prevPos )
                result.push( source.slice( prevPos, match.index ) );
              result.push( '<script>' );
              result.push( minified.code.trim() );
              prevPos = match.index + match[ 0 ].length;
            }
          }
        }
        result.push( source.slice( prevPos ) );
        return result.join( '' );
      },
    },
  };
}
