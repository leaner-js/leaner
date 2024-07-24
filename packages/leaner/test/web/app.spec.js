import { describe, expect, test, vi } from 'vitest';
import { state } from 'leaner';
import { createApp, inject, onDestroy, onMount, provide } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'createApp()', ()=> {
  test( 'simple App', () => {
    function App() {
      return [ 'p', 'Hello, ', [ 'strong', 'world!' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Hello, <strong>world!</strong></p>' );
  } );

  test( 'dynamic App', () => {
    const [ id, setId ] = state( 'test' );
    const [ counter, setCounter ] = state( 4 );

    function App() {
      return [[
        [ 'label', { for: id }, 'Test ', counter ],
        [ 'input', { type: 'text', id, value: counter } ]
      ]];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<label for="test">Test 4</label><input type="text" id="test">' );

    const input = document.querySelector( 'input' );

    expect( input.value ).toBe( '4' );

    setId( 'age' );
    setCounter( 30 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<label for="age">Test 30</label><input type="text" id="age">' );
    expect( input.value ).toBe( '30' );
  } );

  test( 'app.destroy()', () => {
    function App() {
      return [ 'p', 'hello' ];
    }

    const app = createApp( App );
    app.mount( document.body );

    expect( app.destroy ).toBeTypeOf( 'function' );

    app.destroy();

    expect( document.body.innerHTML ).toBe( '' );
  } );

  test( 'onMount()', () => {
    const callback = vi.fn();

    function App() {
      onMount( callback );

      return [ 'p', 'hello' ];
    }

    createApp( App ).mount( document.body );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'onDestroy()', () => {
    const callback = vi.fn();

    function App() {
      onDestroy( callback );

      return [ 'p', 'hello' ];
    }

    const app = createApp( App );
    app.mount( document.body );

    expect( callback ).not.toHaveBeenCalled();

    app.destroy();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'app.provide()', () => {
    function Child( props ) {
      const text = inject( 'text' );

      return [ 'div', props, text ];
    }

    function App() {
      return [ Child, { id: 'test' } ];
    }

    const app = createApp( App );

    app.provide( 'text', 'hello' );

    app.mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div id="test">hello</div>' );
  } );

  test( 'app.use()', () => {
    const callback = vi.fn();

    function plugin() {
      onMount( callback );
      provide( 'text', 'hello' );
    }

    function Child( props ) {
      const text = inject( 'text' );

      return [ 'div', props, text ];
    }

    function App() {
      return [ Child, { id: 'test' } ];
    }

    const app = createApp( App );

    app.use( plugin );

    expect( callback ).not.toHaveBeenCalled();

    app.mount( document.body );

    expect( callback ).toHaveBeenCalledOnce();

    expect( document.body.innerHTML ).toBe( '<div id="test">hello</div>' );
  } );
} );
