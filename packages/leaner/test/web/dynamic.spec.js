import { describe, expect, test, vi } from 'vitest';
import { state } from 'leaner';
import { createApp, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'dynamic directive', () => {
  test( 'HTML elements', () => {
    const [ tag, setTag ] = state( 'p' );

    function App() {
      return [ 'dynamic', tag, 'test' ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setTag( 'div' );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>test</div>' );
  } );

  test( 'components', () => {
    const [ component, setComponent ] = state( Button );

    function Button( props, children ) {
      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function Strong( props, children ) {
      return [ 'strong', props, ...children ];
    }

    function App() {
      return [ 'dynamic', component, { id: 'test' }, 'hello' ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button" id="test">hello</button>' );

    // cannot pass Strong directly because it's a function
    setComponent( () => Strong );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<strong id="test">hello</strong>' );
  } );

  test( 'create component', () => {
    const [ component, setComponent ] = state( Button );

    function Button( props, children ) {
      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    const callback = vi.fn();

    function Strong( props, children ) {
      onMount( callback );

      return [ 'strong', props, ...children ];
    }

    function App() {
      return [ 'dynamic', component, { id: 'test' }, 'hello' ];
    }

    createApp( App ).mount( document.body );

    expect( callback ).not.toHaveBeenCalled();

    setComponent( () => Strong );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<strong id="test">hello</strong>' );
    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ component, setComponent ] = state( Button );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function Strong( props, children ) {
      return [ 'strong', props, ...children ];
    }

    function App() {
      return [ 'dynamic', component, { id: 'test' }, 'hello' ];
    }

    createApp( App ).mount( document.body );

    expect( callback ).not.toHaveBeenCalled();

    setComponent( () => Strong );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<strong id="test">hello</strong>' );
    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'dynamic inside if (true -> false)', () => {
    const [ condition, setCondition ] = state( true );
    const [ tag, setTag ] = state( 'p' );

    function App() {
      return [ 'if', condition, [ 'dynamic', tag, 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setCondition( false );
    setTag( 'div' );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'dynamic inside if (false -> true)', () => {
    const [ condition, setCondition ] = state( false );
    const [ tag, setTag ] = state( 'p' );

    function App() {
      return [ 'if', condition, [ 'dynamic', tag, 'test' ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );
    setTag( 'div' );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>test</div>' );
  } );
} );
