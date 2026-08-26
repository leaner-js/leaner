import leanerJsx from 'leaner-jsx';
import { defineConfig } from 'vite';

export default defineConfig( {
  base: './',
  oxc: {
    jsx: 'preserve',
  },
  plugins: [ leanerJsx() ],
} );
