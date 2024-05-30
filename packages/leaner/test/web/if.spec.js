import { describe, expect, test, vi } from 'vitest';
import { useState } from 'leaner';
import { mount, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'if', () => {
  test( 'simple true -> false', () => {
    const [ condition, setCondition ] = useState( true );

    function template() {
      return [ 'if', condition, [ 'p', 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'simple false -> true', () => {
    const [ condition, setCondition ] = useState( false );

    function template() {
      return [ 'if', condition, [ 'p', 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );
  } );

  test( 'if/else', () => {
    const [ condition, setCondition ] = useState( true );

    function template() {
      return [ 'if', condition, [ 'p', 'test' ], [ 'button', { type: 'button' }, 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );
  } );

  test( 'fragment', () => {
    const [ condition, setCondition ] = useState( true );

    function template() {
      return [ 'if', condition, [[ [ 'p', 'test' ], [ 'button', { type: 'button' }, 'test' ] ]] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p><button type="button">test</button>' );

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'multiple conditions', () => {
    const [ value, setValue ] = useState( 1 );

    function template() {
      return [ 'if',
        () => value() == 1, [ 'p', 'test' ],
        () => value() == 2, [ 'button', { type: 'button' }, 'test' ]
      ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setValue( 2 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    setValue( 3 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'nested', () => {
    const [ condition, setCondition ] = useState( true );
    const [ value, setValue ] = useState( 1 );

    function template() {
      return [ 'if', condition,
        [ 'if',
          () => value() == 1, [ 'p', 'test' ],
          () => value() == 2, [ 'button', { type: 'button' }, 'test' ]
        ],
      ];
    }

    mount( template, document.body );

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
    const [ condition, setCondition ] = useState( false );

    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function template() {
      return [ 'if', condition, [ Button, 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    expect( callback ).not.toHaveBeenCalled();

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ condition, setCondition ] = useState( true );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function template() {
      return [ 'if', condition, [ Button, 'test' ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">test</button>' );

    expect( callback ).not.toHaveBeenCalled();

    setCondition( false );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );
