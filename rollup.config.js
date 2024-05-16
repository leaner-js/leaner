export default [
  {
    input: 'src/core/index.js',
    output: {
      file: 'dist/core.js',
    },
    onwarn,
  },
  {
    input: 'src/web/index.js',
    output: {
      file: 'dist/web.js',
    },
    external: [ 'leaner' ],
    onwarn,
  },
];

function onwarn( msg, warn ) {
  if ( msg.code != 'CIRCULAR_DEPENDENCY' )
    warn( msg );
}
