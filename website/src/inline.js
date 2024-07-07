const theme = localStorage.getItem( 'theme' ) || 'auto';
if ( theme == 'dark' || theme == 'auto' && matchMedia( '(prefers-color-scheme: dark)' ).matches )
  document.documentElement.classList.add( 'dark' );

const size = localStorage.getItem( 'font-size' ) || 'normal';
if ( size == 'lg' )
  document.documentElement.classList.add( 'font-size-lg' );
