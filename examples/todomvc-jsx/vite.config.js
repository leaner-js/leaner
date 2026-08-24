import { defineConfig } from 'vite';
import leanerJsx from 'leaner-jsx';

export default defineConfig( {
  base: './',
  esbuild: {
    jsx: 'preserve',
  },
  plugins: [ leanerJsx() ],
} );
