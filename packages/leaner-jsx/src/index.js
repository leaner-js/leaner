import { generateTransform, rolldownString } from 'rolldown-string'

import { transform } from './transform';

let oxcParser = null;
let importFailed = false;

export default function leanerJsx() {
  return {
    name: 'leaner-jsx',

    transform: {
      filter: {
        id: /\.[jt]sx(?:$|\?)/,
      },

      async handler( code, id, meta ) {
        const program = await parse( this, code, id, meta );

        if ( program == null )
          return;

        const mappedCode = rolldownString( code, id, meta );

        try {
          transform( program, null, mappedCode );
        } catch ( error ) {
          if ( error instanceof SyntaxError ) {
            this.error( error.message );
            return;
          }
          throw error;
        }

        return generateTransform( mappedCode, id );
      },
    },
  };
}

async function parse( ctx, code, id, meta ) {
  // When running with Rolldown, parse() supports JSX syntax natively
  if ( ctx.meta?.rolldownVersion != null ) {
    if ( meta?.ast != null )
      return meta.ast;

    const [ filepath ] = id.split( '?' );
    const lang = filepath.endsWith( '.tsx' ) ? 'tsx' : 'jsx';

    return ctx.parse( code, { lang } );
  }

  // Otherwise, fallback to 'oxc-parser'
  if ( oxcParser == null && !await importOxcParser() ) {
    ctx.error( `[leaner-jsx] When running with Rollup, you must install 'oxc-parser'. Alternatively, migrate to Rolldown or Vite 8+ for native JSX support.` );
    return null;
  }

  const { program, errors } = oxcParser.parseSync( id, code );

  for ( const error of errors ) {
    if ( error.severity == 'Error' ) {
      ctx.error( error.message );
      return null;
    } else if ( error.severity == 'Warning' ) {
      ctx.warn( error.message );
    }
  }

  return program;
}

async function importOxcParser() {
  if ( importFailed )
    return false;

  try {
    oxcParser = await import( 'oxc-parser' );
  } catch {
    importFailed = true;
    return false;
  }

  return true;
}
