import { describe, expect, test, vi } from 'vitest';
import { state, reactive } from 'leaner';
import { createApp, inject, onDestroy, onMount, provide } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'components', () => {
  test( 'simple component', () => {
    const Button = vi.fn( ( props, children ) => {
      return [ 'button', { type: 'button', ...props }, ...children ];
    } );

    function App() {
      return [ Button, { id: 'test' }, 'hello' ];
    }

    createApp( App ).mount( document.body );

    expect( Button ).toHaveBeenCalledOnce();

    expect( document.body.innerHTML ).toBe( '<button type="button" id="test">hello</button>' );
  } );

  test( 'dynamic component', () => {
    const [ id, setId ] = state( 'test' );
    const [ text, setText ] = state( 'hello' );

    const Button = vi.fn( ( props, children ) => {
      return [ 'button', { type: 'button', ...props }, ...children ];
    } );

    function App() {
      return [ Button, { id }, text ];
    }

    createApp( App ).mount( document.body );

    expect( Button ).toHaveBeenCalledOnce();

    expect( document.body.innerHTML ).toBe( '<button type="button" id="test">hello</button>' );

    Button.mockClear();

    setId( 'button' );
    setText( 'OK' );

    runSchedule();

    expect( Button ).not.toHaveBeenCalled();

    expect( document.body.innerHTML ).toBe( '<button type="button" id="button">OK</button>' );
  } );

  test( 'multiple instances', () => {
    const Button = vi.fn( ( props, children ) => {
      return [ 'button', { type: 'button', ...props }, ...children ];
    } );

    function App() {
      return [[
        [ Button, { id: 'first' }, 'hello' ],
        [ Button, { id: 'second' }, 'world' ],
      ]];
    }

    createApp( App ).mount( document.body );

    expect( Button ).toHaveBeenCalledTimes( 2 );

    expect( document.body.innerHTML ).toBe( '<button type="button" id="first">hello</button><button type="button" id="second">world</button>' );
  } );

  test( 'onMount()', () => {
    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ Button, { id: 'test' }, 'hello' ];
    }

    createApp( App ).mount( document.body );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'onDestroy()', () => {
    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ Button, { id: 'test' }, 'hello' ];
    }

    const app = createApp( App );
    app.mount( document.body );

    expect( callback ).not.toHaveBeenCalled();

    app.destroy();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'stop watching when destroyed', () => {
    const [ getValue, setValue ] = state( 'apples' );

    const callback = vi.fn();

    function Button( props, children ) {
      reactive( getValue, callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ Button, { id: 'test' }, 'hello' ];
    }

    const app = createApp( App );
    app.mount( document.body );

    expect( callback ).toHaveBeenCalledOnce();

    app.destroy();

    callback.mockClear();

    setValue( 'oranges' );

    runSchedule();

    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'provide/inject', () => {
    function Child( props ) {
      const text = inject( 'text' );

      return [ 'div', props, text ];
    }

    function App() {
      provide( 'text', 'hello' );

      return [ Child, { id: 'test' } ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div id="test">hello</div>' );
  } );
} );
