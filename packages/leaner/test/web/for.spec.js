import { describe, expect, test, vi } from 'vitest';
import { mutate, state } from 'leaner';
import { createApp, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';

describe( 'for directive', () => {
  test( 'simple values', () => {
    const [ items, ] = state( [ 'one', 'two', 'three' ] );

    function App() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div><div>three</div>' );
  } );

  test( 'push value', () => {
    const [ items, setItems ] = state( [ 'one', 'two' ] );

    function App() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate( items => items.push( 'three' ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div><div>three</div>' );
  } );

  test( 'pop value', () => {
    const [ items, setItems ] = state( [ 'one', 'two', 'three' ] );

    function App() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate( items => items.pop() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div>' );
  } );

  test( 'replace value', () => {
    const [ items, setItems ] = state( [ 'one', 'two', 'three' ] );

    function App() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate( items => items[ 1 ] = 'test' ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>test</div><div>three</div>' );
  } );

  test( 'empty array', () => {
    const [ items, setItems ] = state( [] );

    function App() {
      return [ 'for', items, item => [ 'div', item ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setItems( mutate( items => items.push( 'one' ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div>' );
  } );

  test( 'objects', () => {
    const [ items, ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>oranges</div>' );
  } );

  test( 'push object', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate ( items => items.push( { name: 'oranges', count: 7 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>oranges</div>' );
  } );

  test( 'pop object', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate ( items => items.pop() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div>' );
  } );

  test( 'replace object', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate ( items => items[ 1 ] = { name: 'peaches', count: 10 } ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>peaches</div>' );
  } );

  test( 'insert object', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate ( items => items.splice( 1, 0, { name: 'peaches', count: 10 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>peaches</div><div>oranges</div>' );
  } );

  test( 'remove object', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate ( items => items.splice( 0, 1 ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>oranges</div>' );
  } );

  test( 'remove and update object', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 }, { name: 'peaches', count: 10 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( mutate ( items => items.splice( 0, 1 ) ) );

    runSchedule();

    setItems( mutate ( items => items[ 1 ].name = 'cherries' ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>oranges</div><div>cherries</div>' );
  } );

  test( 'create component', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 } ] );

    const callback = vi.fn();

    function Button( props, children ) {
      onMount( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ 'for', items, item => [ Button, item.name ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button>' );

    expect( callback ).toHaveBeenCalledOnce();

    callback.mockClear();

    setItems( mutate ( items => items.push( { name: 'oranges', count: 7 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button><button type="button">oranges</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'destroy component', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const callback = vi.fn();

    function Button( props, children ) {
      onDestroy( callback );

      return [ 'button', { type: 'button', ...props }, ...children ];
    }

    function App() {
      return [ 'for', items, item => [ Button, item.name ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button">apples</button><button type="button">oranges</button>' );

    expect( callback ).not.toHaveBeenCalled();

    setItems( mutate ( items => items.shift() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<button type="button">oranges</button>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'swap adjacent nodes', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 }, { name: 'peaches', count: 10 }, { name: 'cherries', count: 15 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( items => [ items[ 0 ], items[ 2 ], items[ 1 ], items[ 3 ] ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>peaches</div><div>oranges</div><div>cherries</div>' );
  } );

  test( 'reorder nodes', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 }, { name: 'peaches', count: 10 }, { name: 'cherries', count: 15 } ] );

    function App() {
      return [ 'for', items, item => [ 'div', item.name ] ];
    }

    createApp( App ).mount( document.body );

    setItems( items => [ items[ 0 ], items[ 3 ], items[ 2 ], items[ 1 ] ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>apples</div><div>cherries</div><div>peaches</div><div>oranges</div>' );
  } );

  test( 'for inside if (true -> false)', () => {
    const [ condition, setCondition ] = state( true );
    const [ items, setItems ] = state( [ 'one', 'two', 'three' ] );

    function App() {
      return [ 'if', condition, [ 'for', items, item => [ 'div', item ] ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div><div>three</div>' );

    setCondition( false );
    setItems( [ 'one', 'two' ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'for inside if (false -> true)', () => {
    const [ condition, setCondition ] = state( false );
    const [ items, setItems ] = state( [ 'one', 'two', 'three' ] );

    function App() {
      return [ 'if', condition, [ 'for', items, item => [ 'div', item ] ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );
    setItems( [ 'one', 'two' ] );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>one</div><div>two</div>' );
  } );

  test( 'for with index', () => {
    const [ items, setItems ] = state( [ 'apples', 'oranges', 'peaches' ] );

    function App() {
      return [ 'for', items, ( item, index ) => [ 'div', index, ': ', item ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>0: apples</div><div>1: oranges</div><div>2: peaches</div>' );

    setItems( mutate ( items => items.shift() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>0: oranges</div><div>1: peaches</div>' );
  } );

  test( 'for with objects and index', () => {
    const [ items, setItems ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 }, { name: 'peaches', count: 10 } ] );

    function App() {
      return [ 'for', items, ( item, index ) => [ 'div', index, ': ', item.name ] ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>0: apples</div><div>1: oranges</div><div>2: peaches</div>' );

    setItems( mutate ( items => items.shift() ) );

    // the first run updates the for directive; the second run updates the indexes
    runSchedule();
    runSchedule();

    expect( document.body.innerHTML ).toBe( '<div>0: oranges</div><div>1: peaches</div>' );
  } );

  test( 'for with fragment', () => {
    const [ items, setItems ] = state( [
      { name: 'apple', description: 'a fruit' },
      { name: 'dog', description: 'an animal' },
    ] );

    function App() {
      return [ 'dl',
        [ 'for', items, item => [[
          [ 'dt', item.name ],
          [ 'dd', item.description ],
        ]] ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<dl><dt>apple</dt><dd>a fruit</dd><dt>dog</dt><dd>an animal</dd></dl>' );

    setItems( mutate ( items => items.shift() ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<dl><dt>dog</dt><dd>an animal</dd></dl>' );
  } );

  test( 'replace select options', () => {
    const [ items, setItems ] = state( [ { id: 1, name: 'apples' }, { id: 2, name: 'oranges' } ] );
    const [ value ] = state( 2 );

    function App() {
      return [ 'select', { value },
        [ 'for', items, item => [ 'option', { value: item.id }, item.name ] ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<select><option value="1">apples</option><option value="2">oranges</option></select>' );

    const select = document.querySelector( 'select' );

    expect( select.value ).toBe( '2' );

    setItems( [ { id: 1, name: 'apples' }, { id: 2, name: 'oranges' } ] );

    runSchedule();

    expect( select.value ).toBe( '2' );
  } );
} );
