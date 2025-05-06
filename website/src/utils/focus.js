/*
 * This code is based on the https://github.com/WICG/focus-visible polyfill, but the .focus-visible
 * class is applied to the root html element, not the currently focused element.
 */

let hadKeyboardEvent = false;
let hadFocusVible = false;

let keyboardEventTimeout = null;
let blurTimeout = null;

let focusVisibleClassName = null;

let trappedContainer = null;

export function handleFocusVisible( className = 'focus-visible' ) {
  focusVisibleClassName = className;

  document.addEventListener( 'keydown', onKeyDown, true );
  document.addEventListener( 'focus', onFocus, true );
  document.addEventListener( 'blur', onBlur, true );
  document.addEventListener( 'visibilitychange', onVisibilityChange, true );
}

export function trapFocus( container ) {
  trappedContainer = container;
}

export function untrapFocus( container ) {
  if ( trappedContainer == container )
    trappedContainer = null;
}

function onKeyDown( e ) {
  if ( e.metaKey || e.altKey || e.ctrlKey )
    return;

  hadKeyboardEvent = true;

  if ( keyboardEventTimeout != null )
    clearTimeout( keyboardEventTimeout );

  keyboardEventTimeout = setTimeout( () => { hadKeyboardEvent = false; }, 100 );

  if ( e.keyCode == 9 && trappedContainer != null ) {
    let trappedFirst = null, trappedLast = null;

    const focusableElements = trappedContainer.querySelectorAll( 'a[href], button, input, textarea, select' );

    for ( const element of focusableElements ) {
      if ( elementIsFocusable( element ) ) {
        if ( trappedFirst == null )
          trappedFirst = element;
        trappedLast = element;
      }
    }

    if ( e.shiftKey ) {
      if ( document.activeElement == trappedFirst || !trappedContainer.contains( document.activeElement ) ) {
        trappedLast.focus();
        e.preventDefault();
      }
    } else {
      if ( document.activeElement == trappedLast || !trappedContainer.contains( document.activeElement ) ) {
        trappedFirst.focus();
        e.preventDefault();
      }
    }
  }
}

function onFocus( e ) {
  if ( hadKeyboardEvent || elementHasFocusVisible( e.target ) )
    document.documentElement.classList.add( focusVisibleClassName );
}

function onBlur() {
  if ( document.documentElement.classList.contains( focusVisibleClassName ) ) {
    hadFocusVible = true;

    if ( blurTimeout != null )
      clearTimeout( blurTimeout );

    blurTimeout = setTimeout( () => { hadFocusVible = false; }, 100 );

    document.documentElement.classList.remove( focusVisibleClassName );
  }
}

function onVisibilityChange() {
  if ( document.visibilityState == 'hidden' ) {
    // if this tab change caused a blur when the .focus-visible class was applied,
    // re-apply if when the user switches back to the tab
    if ( hadFocusVible )
      hadKeyboardEvent = true;
  } else if ( hadKeyboardEvent ) {
    if ( keyboardEventTimeout != null )
      clearTimeout( keyboardEventTimeout );

    keyboardEventTimeout = setTimeout( () => { hadKeyboardEvent = false; }, 100 );
  }
}

const InputTypes = {
  date: true,
  datetime: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true,
};

function elementHasFocusVisible( element ) {
  if ( element.tagName === 'INPUT' && InputTypes[ element.type ] && !element.readOnly )
    return true;

  if ( element.tagName === 'TEXTAREA' && !element.readOnly )
    return true;

  if ( element.isContentEditable )
    return true;

  return false;
}

function elementIsFocusable( element ) {
  if ( element.disabled || element.tabIndex < 0 )
    return false;

  if ( element.tagName === 'INPUT' )
    return element.type != 'hidden';

  return true;
}
