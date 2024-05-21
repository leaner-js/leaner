import { describe, expect, test, vi } from 'vitest';
import { useState } from 'leaner';
import { mount, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'mount()', () => {
  test( 'simple template', () => {
    function template() {
      return [ 'p', 'Hello, ', [ 'strong', 'world!' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>Hello, <strong>world!</strong></p>' );
  } );

  test( 'dynamic template', () => {
    const [ id, setId ] = useState( 'test' );
    const [ counter, setCounter ] = useState( 4 );

    function template() {
      return [[
        [ 'label', { for: id }, 'Test ', counter ],
        [ 'input', { type: 'text', id, value: counter } ]
      ]];
    }

    mount( template, document.body );

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
    function template() {
      return [ 'p', 'hello' ];
    }

    const app = mount( template, document.body );

    expect( app.destroy ).toBeTypeOf( 'function' );

    app.destroy();

    expect( document.body.innerHTML ).toBe( '' );
  } );

  test( 'onMount()', () => {
    const callback = vi.fn();

    function template() {
      onMount( callback );

      return [ 'p', 'hello' ];
    }

    mount( template, document.body );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'onDestroy()', () => {
    const callback = vi.fn();

    function template() {
      onDestroy( callback );

      return [ 'p', 'hello' ];
    }

    const app = mount( template, document.body );

    expect( callback ).not.toHaveBeenCalled();

    app.destroy();

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );
