import { readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

if ( process.argv.length != 3 ) {
  console.error( 'Usage: node scripts/version.js VERSION' );
  process.exit( 1 );
}

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const rootDir = dirname( __dirname );

const packageName = 'leaner';
const version = process.argv[ 2 ];

const rootPackage = await readJson( 'package.json' );

for ( const workspace of rootPackage.workspaces )
  await processWorkspace( workspace );

console.log( 'Done. Run `npm install` now.' );

async function processWorkspace( workspace ) {
  const name = `${ workspace }/package.json`;

  const data = await readJson( name );

  if ( data.name == packageName ) {
    data.version = version;
    await writeJson( name, data );
    console.log( `${workspace}: "version": "${ version }"` );
  } else if ( data.dependencies != null && data.dependencies[ packageName ] != null ) {
    data.dependencies[ packageName ] = `^${ version }`;
    await writeJson( name, data );
    console.log( `${workspace}: "${ packageName }": "^${ version }"` );
  }
}

async function readJson( name ) {
  const path = resolve( rootDir, name );
  const body = await readFile( path, 'utf-8' );
  return JSON.parse( body );
}

async function writeJson( name, data ) {
  const path = resolve( rootDir, name );
  const body = JSON.stringify( data, null, 2 ) + '\n';
  await writeFile( path, body, 'utf-8' );
}
