import { handleFocusVisible, trapFocus, untrapFocus } from './utils/focus';

window.addEventListener( 'DOMContentLoaded', () => {
  handleFocusVisible();

  if ( document.body.classList.contains( 'with-sidebar' ) )
    handleSidebar();
} );

function handleSidebar() {
  const sidebar = document.querySelector( '.sidebar' );

  document.getElementById( 'show-menu' ).addEventListener( 'click', openSidebar );
  document.getElementById( 'hide-menu' ).addEventListener( 'click', closeSidebar );

  sidebar.addEventListener( 'keydown', e => {
    if ( e.keyCode == 27 )
      closeSidebar();
  } );

  sidebar.addEventListener( 'click', e => {
    if ( e.target == sidebar || e.target.tagName == 'A' )
      closeSidebar();
  } );

  sidebar.addEventListener( 'transitionend', () => {
    if ( !document.body.classList.contains( 'sidebar-fade' ) )
      document.body.classList.remove( 'sidebar-open' );
  } );

  function openSidebar() {
    document.body.classList.add( 'sidebar-open' );
    trapFocus( sidebar );
    setTimeout( () => {
      document.body.classList.add( 'sidebar-fade' );
    }, 0 );
  }

  function closeSidebar() {
    document.body.classList.remove( 'sidebar-fade' );
    untrapFocus( sidebar );
  }
}
