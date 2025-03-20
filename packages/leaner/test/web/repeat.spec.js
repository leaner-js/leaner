import { describe, expect, test, vi } from 'vitest';
import { state } from 'leaner';
import { createApp, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'repeat directive', () => {
  test( 'constant value', () => {
    function App() {
      return [ 'repeat', 3, index => [ 'div', index ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>0</div><div>1</div><div>2</div>' );
  } );

  test( 'reactive value', () => {
    const [ count, ] = state( 3 );

    function App() {
      return [ 'repeat', count, index => [ 'div', index ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>0</div><div>1</div><div>2</div>' );
  } );

  test( 'increase value', () => {
    const [ count, setCount ] = state( 3 );

    function App() {
      return [ 'repeat', count, index => [ 'div', index ] ];
    }

    createApp( App ).mount( document.body );

    setCount( 4 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>0</div><div>1</div><div>2</div><div>3</div>' );
  } );

  test( 'decrease value', () => {
    const [ count, setCount ] = state( 3 );

    function App() {
      return [ 'repeat', count, index => [ 'div', index ] ];
    }

    createApp( App ).mount( document.body );

    setCount( 2 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>0</div><div>1</div>' );
  } );

  test( '0 value', () => {
    const [ count, setCount ] = state( 0 );

    function App() {
      return [ 'repeat', count, index => [ 'div', index ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCount( 1 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>0</div>' );
  } );

  test( 'create component', () => {
    const [ count, setCount ] = state( 1 );

    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ 'repeat', count, index => [ Button, index ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">0</button>' );

    expect( callback ).toHaveBeenCalledOnce();

    callback.mockClear();

    setCount( 2 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">0</button><button type="button">1</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ count, setCount ] = state( 2 );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ 'repeat', count, index => [ Button, index ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">0</button><button type="button">1</button>' );

    expect( callback ).not.toHaveBeenCalled();

    setCount( 1 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">0</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );
