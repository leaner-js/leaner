import { describe, expect, test, vi } from 'vitest';
import { useState } from 'leaner';
import { mount, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'dynamic directive', () => {
  test( 'HTML elements', () => {
    const [ tag, setTag ] = useState( 'p' );

    function template() {
      return [ 'dynamic', tag, 'test' ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setTag( 'div' );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>test</div>' );
  } );

  test( 'components', () => {
    const [ component, setComponent ] = useState( Button );

    function Button( props, children ) {
      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function Strong( props, children ) {
      return [ 'strong', props, ...children ];
    }

    function template() {
      return [ 'dynamic', component, { id: 'test' }, 'hello' ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button" id="test">hello</button>' );

    // cannot pass Strong directly because it's a function
    setComponent( () => Strong );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<strong id="test">hello</strong>' );
  } );

  test( 'create component', () => {
    const [ component, setComponent ] = useState( Button );

    function Button( props, children ) {
      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    const callback = vi.fn();

    function Strong( props, children ) {
      onMount( callback );

      return [ 'strong', props, ...children ];
    }

    function template() {
      return [ 'dynamic', component, { id: 'test' }, 'hello' ];
    }

    mount( template, document.body );

    expect( callback ).not.toHaveBeenCalled();

    setComponent( () => Strong );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<strong id="test">hello</strong>' );
    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ component, setComponent ] = useState( Button );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function Strong( props, children ) {
      return [ 'strong', props, ...children ];
    }

    function template() {
      return [ 'dynamic', component, { id: 'test' }, 'hello' ];
    }

    mount( template, document.body );

    expect( callback ).not.toHaveBeenCalled();

    setComponent( () => Strong );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<strong id="test">hello</strong>' );
    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'dynamic inside if (true -> false)', () => {
    const [ condition, setCondition ] = useState( true );
    const [ tag, setTag ] = useState( 'p' );

    function template() {
      return [ 'if', condition, [ 'dynamic', tag, 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setCondition( false );
    setTag( 'div' );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'dynamic inside if (false -> true)', () => {
    const [ condition, setCondition ] = useState( false );
    const [ tag, setTag ] = useState( 'p' );

    function template() {
      return [ 'if', condition, [ 'dynamic', tag, 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );
    setTag( 'div' );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>test</div>' );
  } );
} );
