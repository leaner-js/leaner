import { parseSync } from 'oxc-parser';
import { generateTransform, rolldownString } from 'rolldown-string'

import { transform } from './transform';

export default function leanerJsx() {
  return {
    name: 'leaner-jsx',

    transform( code, id, meta ) {
      if ( !id.match( /\.(jsx|tsx)$/ ) )
        return;

      const { program, errors } = parseSync( id, code );

      for ( const error of errors ) {
        if ( error.severity == 'Error' ) {
          this.error( error.message );
          return;
        } else if ( error.severity == 'Warning' ) {
          this.warn( error.message );
        }
      }

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
  };
}
