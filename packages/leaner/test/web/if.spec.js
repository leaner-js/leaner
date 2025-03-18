import { describe, expect, test, vi } from 'vitest';
import { state } from 'leaner';
import { createApp, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'if / switch', () => {
  test( 'simple true -> false', () => {
    const [ condition, setCondition ] = state( true );

    function App() {
      return [ 'if', condition, [ 'p', 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'simple false -> true', () => {
    const [ condition, setCondition ] = state( false );

    function App() {
      return [ 'if', condition, [ 'p', 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );
  } );

  test( 'if/else', () => {
    const [ condition, setCondition ] = state( true );

    function App() {
      return [ 'switch',
        [ 'if', condition, [ 'p', 'test' ] ],
        [ 'else', [ 'button', { type: 'button' }, 'test' ] ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );
  } );

  test( 'multiple children', () => {
    const [ condition, setCondition ] = state( true );

    function App() {
      return [ 'if', condition, [ 'p', 'test' ], [ 'button', { type: 'button' }, 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p><button type="button">test</button>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'if/else with multiple children', () => {
    const [ condition, setCondition ] = state( true );

    function App() {
      return [ 'switch',
        [ 'if', condition, [ 'p', 'test' ], [ 'button', { type: 'button' }, 'ok' ] ],
        [ 'else', [ 'h1', 'else' ], [ 'button', { type: 'button' }, 'cancel' ] ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p><button type="button">ok</button>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<h1>else</h1><button type="button">cancel</button>' );
  } );

  test( 'multiple conditions', () => {
    const [ value, setValue ] = state( 1 );

    function App() {
      return [ 'switch',
        [ 'if', () => value() == 1, [ 'p', 'test' ] ],
        [ 'if', () => value() == 2, [ 'button', { type: 'button' }, 'test' ] ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setValue( 2 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    setValue( 3 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'nested', () => {
    const [ condition, setCondition ] = state( true );
    const [ value, setValue ] = state( 1 );

    function App() {
      return [ 'if', condition,
        [ 'switch',
          [ 'if', () => value() == 1, [ 'p', 'test' ] ],
          [ 'if', () => value() == 2, [ 'button', { type: 'button' }, 'test' ] ],
        ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setValue( 2 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setValue( 1 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'create component', () => {
    const [ condition, setCondition ] = state( false );

    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ 'if', condition, [ Button, 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    expect( callback ).not.toHaveBeenCalled();

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ condition, setCondition ] = state( true );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ 'if', condition, [ Button, 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    expect( callback ).not.toHaveBeenCalled();

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'unexpected else', () => {
    function App() {
      return [ 'else', [ 'p', 'test' ] ];
    }

    expect( () => {
      createApp( App ).mount( document.body );
    } ).toThrowError( 'Unexpected else directive' );
  } );
} );
