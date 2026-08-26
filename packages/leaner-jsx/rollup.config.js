import { defineConfig } from 'rollup';

export default defineConfig( {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
  },
  external: [ 'oxc-parser', 'rolldown-string' ],
  onwarn,
} );

function onwarn( msg, warn ) {
  if ( msg.code != 'CIRCULAR_DEPENDENCY' )
    warn( msg );
}
