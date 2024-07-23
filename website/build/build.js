import { mkdir, readFile, stat, watch } from 'fs/promises';
import { dirname, resolve } from 'path';
import { join } from 'path/posix';
import { fileURLToPath } from 'url';

import { glob } from 'glob';
import Handlebars from 'handlebars';
import { build } from 'vite';

import { generate404, generateFile } from './utils/generate.js';
import { createDevServer } from './utils/server.js';
import { inlineScript } from './utils/vite-inline-script.js';

import config from '../config.js';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const rootDir = dirname( __dirname );

let watchMode = false;

for ( let i = 2; i < process.argv.length; i++ ) {
  const arg = process.argv[ i ];
  switch ( arg ) {
    case '--watch':
      watchMode = true;
      break;
    default:
      help();
      break;
  }
}

let template = null;
let files = null;

let pending = Promise.resolve();
let queued = new Set();

const plugins = [ inlineScript() ];

if ( watchMode ) {
  await runInWatchMode();
} else {
  await build( { plugins } );
  await generateAllFiles();
}

async function generateAllFiles( server ) {
  try {
    const content = await readFile( resolve( rootDir, 'dist/index.html' ), 'utf-8' );

    template = Handlebars.compile( content );

    files = await glob( '**/*.md', { cwd: resolve( rootDir, 'docs' ), posix: true } );

    for ( const file of files )
      await generateFile( file, rootDir, template, config, files );

    await generate404( '404.md', rootDir, template, config );

    if ( server != null )
      server.reload();
  } catch ( err ) {
    if ( err.code != 'ENOENT' )
      console.error( err );
  }
}

async function runInWatchMode() {
  const distDir = resolve( rootDir, 'dist' );
  await mkdir( distDir, { recursive: true } );

  const port = config.port || 3000;

  const server = await createDevServer( distDir, port );

  console.log( `Listening on ${server.baseUrl}\n` );
  console.log( 'Press q to exit\n' );

  const bundle = await build( {
    build: { watch: true },
    plugins,
  } );

  bundle.on( 'event', event => {
    if ( event.code == 'END' ) {
      enqueue( () => generateAllFiles( server ) );
    }
  } );

  const ac = new AbortController();
  const watcher = watch( resolve( rootDir, 'docs' ), { recursive: true, signal: ac.signal } );

  process.stdin.setRawMode( true );
  process.stdin.setEncoding( 'utf-8' );

  process.stdin.on( 'data', ch => {
    if ( ch == 'q' || ch == '\x03' ) {
      process.stdin.pause();
      ac.abort();
      bundle.close();
      server.close();
    }
  } );

  try {
    for await ( const event of watcher ) {
      if ( !queued.has( event.filename ) ) {
        queued.add( event.filename );
        enqueue( () => handleFileChange( event.filename, server ) );
      }
    }
  } catch ( err ) {
    if ( err.name == 'AbortError' )
      return;
    throw err;
  }
}

async function handleFileChange( file, server ) {
  if ( template == null )
    return;

  try {
    const stats = await stat( resolve( rootDir, 'docs', file ) );
    if ( stats.isFile() ) {
      const inputFile = file.replaceAll( '\\', '/' );
      const outputFile = inputFile.replace( /.md$/, '.html' );
      console.log( join( 'dist', outputFile ) );
      await generateFile( inputFile, rootDir, template, config, files );
      queued.delete( file );
      server.reload( outputFile );
    }
  } catch ( err ) {
    if ( err.code != 'ENOENT' )
      console.error( err );
  }
}

function enqueue( fn ) {
  pending.finally( () => {
    pending = fn();
  } );
}

function help() {
  console.log( 'Usage: node build.js [--watch]' );

  process.exit( 1 );
}
