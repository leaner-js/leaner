import { buildDocs, inlineScript } from 'leaner-doc-utils';
import { build, defineConfig } from 'vite';

import config from '../config.js';

import leanerPackage from '../../packages/leaner/package.json' with { type: 'json' };

let watch = false;

for ( let i = 2; i < process.argv.length; i++ ) {
  const arg = process.argv[ i ];
  switch ( arg ) {
    case '--watch':
      watch = true;
      break;
    default:
      help();
      break;
  }
}

const viteConfig = defineConfig( {
  build: {
    watch,
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [ 'color-functions', 'global-builtin', 'import' ],
      },
    },
  },
  plugins: [
    buildDocs( {
      ...config,
      tags: { '$VERSION$': getCaretVersion( leanerPackage.version ) },
      onStartup,
    } ),
    inlineScript(),
  ],
} );

const result = await build( viteConfig );

if ( watch ) {
  process.stdin.setRawMode( true );
  process.stdin.setEncoding( 'utf-8' );

  process.stdin.on( 'data', ch => {
    if ( ch == 'q' || ch == '\x03' ) {
      process.stdin.pause();
      result.close();
    }
  } );
}

function onStartup( server ) {
  console.log( `Listening on ${server.baseUrl}\n` );
  console.log( 'Press q to exit\n' );
}

function help() {
  console.log( 'Usage: node build.js [--watch]' );

  process.exit( 1 );
}

function getCaretVersion( version ) {
  const parts = version.split( '.' );
  const firstNonZero = parts.findIndex( p => p != '0' );
  return parts.slice( 0, firstNonZero + 1 ).join( '.' );
}
