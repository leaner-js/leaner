import { join, resolve } from 'path';

import { defineConfig } from 'vitest/config';

const rootPath = resolve( __dirname );

export default defineConfig( {
  test: {
    setupFiles: [ 'test/setup.js' ],
    workspace: [
      {
        extends: true,
        test: {
          include: [ 'test/core/**' ],
          name: 'core',
        },
      },
      {
        extends: true,
        test: {
          include: [ 'test/web/**' ],
          name: 'web',
          environment: 'jsdom',
        },
      },
    ],
  },
  resolve: {
    alias: {
      'leaner/web': join( rootPath, 'src/web' ),
      'leaner': join( rootPath, 'src/core' ),
    },
  },
} );
