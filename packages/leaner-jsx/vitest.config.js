import { join, resolve } from 'path';

import { defineConfig } from 'vitest/config';

const rootPath = resolve( __dirname );

export default defineConfig( {
  test: {
    include: [ 'test/**' ],
  },
  resolve: {
    alias: {
      'leaner-jsx': join( rootPath, 'src' ),
    },
  },
} );
