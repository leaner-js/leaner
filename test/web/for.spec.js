import { describe, expect, test, vi } from 'vitest';
import { mutate, useState } from 'leaner';
import { mount, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'for directive', () => {
  test( 'simple values', () => {
    const [ items, ] = useState( [ 'one', 'two', 'three' ] );

    function template() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div><div>three</div>' );
  } );

  test( 'push value', () => {
    const [ items, setItems ] = useState( [ 'one', 'two' ] );

    function template() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    mount( template, document.body );

    setItems( mutate( items => items.push( 'three' ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div><div>three</div>' );
  } );

  test( 'pop value', () => {
    const [ items, setItems ] = useState( [ 'one', 'two', 'three' ] );

    function template() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    mount( template, document.body );

    setItems( mutate( items => items.pop() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div>' );
  } );

  test( 'replace value', () => {
    const [ items, setItems ] = useState( [ 'one', 'two', 'three' ] );

    function template() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    mount( template, document.body );

    setItems( mutate( items => items[ 1 ] = 'test' ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>test</div><div>three</div>' );
  } );

  test( 'empty array', () => {
    const [ items, setItems ] = useState( [] );

    function template() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setItems( mutate( items => items.push( 'one' ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div>' );
  } );

  test( 'objects', () => {
    const [ items, ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>oranges</div>' );
  } );

  test( 'push object', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    setItems( mutate ( items => items.push( { name: 'oranges', count: 7 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>oranges</div>' );
  } );

  test( 'pop object', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    setItems( mutate ( items => items.pop() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div>' );
  } );

  test( 'replace object', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    setItems( mutate ( items => items[ 1 ] = { name: 'peaches', count: 10 } ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>peaches</div>' );
  } );

  test( 'insert object', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    setItems( mutate ( items => items.splice( 1, 0, { name: 'peaches', count: 10 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>peaches</div><div>oranges</div>' );
  } );

  test( 'remove object', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    setItems( mutate ( items => items.splice( 0, 1 ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>oranges</div>' );
  } );

  test( 'remove and update object', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 }, { name: 'peaches', count: 10 } ] );

    function template() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    mount( template, document.body );

    setItems( mutate ( items => items.splice( 0, 1 ) ) );

    runSchedule();

    setItems( mutate ( items => items[ 1 ].name = 'cherries' ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>oranges</div><div>cherries</div>' );
  } );

  test( 'create component', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 } ] );

    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function template() {
      return [ 'for', items, item => [ Button, item.name ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button>' );

    expect( callback ).toHaveBeenCalledOnce();

    callback.mockClear();

    setItems( mutate ( items => items.push( { name: 'oranges', count: 7 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button><button type="button">oranges</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function template() {
      return [ 'for', items, item => [ Button, item.name ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button><button type="button">oranges</button>' );

    expect( callback ).not.toHaveBeenCalled();

    setItems( mutate ( items => items.shift() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">oranges</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'reorder components', () => {
    const [ items, setItems ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function template() {
      return [ 'for', items, item => [ Button, item.name ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button><button type="button">oranges</button>' );

    expect( callback ).toHaveBeenCalledTimes( 2 );

    callback.mockClear();

    setItems( items => [ items[ 1 ], items[ 0 ] ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">oranges</button><button type="button">apples</button>' );

    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'for inside if (true -> false)', () => {
    const [ condition, setCondition ] = useState( true );
    const [ items, setItems ] = useState( [ 'one', 'two', 'three' ] );

    function template() {
      return [ 'if', condition, [ 'for', items, item => [ 'div', item ] ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div><div>three</div>' );

    setCondition( false );
    setItems( [ 'one', 'two' ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'for inside if (false -> true)', () => {
    const [ condition, setCondition ] = useState( false );
    const [ items, setItems ] = useState( [ 'one', 'two', 'three' ] );

    function template() {
      return [ 'if', condition, [ 'for', items, item => [ 'div', item ] ] ];
    }

    mount( template, document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );
    setItems( [ 'one', 'two' ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div>' );
  } );
} );
