import { defineConfig } from 'vitest/config';
import { join, resolve } from 'path';

const rootPath = resolve( __dirname );

export default defineConfig( {
  test: {
    setupFiles: [ 'test/setup.js' ],
    environmentMatchGlobs: [
      [ 'test/web/**', 'jsdom' ],
    ],
  },
  resolve: {
    alias: {
      'leaner/web': join( rootPath, 'src/web' ),
      'leaner': join( rootPath, 'src/core' ),
    },
  },
} );
