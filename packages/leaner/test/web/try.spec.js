import { describe, expect, test, vi } from 'vitest';
import { mutate, state } from 'leaner';
import { createApp, onDestroy, onMount } from 'leaner/web';
import { runSchedule } from 'leaner/schedule.js';
import { reactive } from 'leaner';

describe( 'try', () => {
  test( 'invalid template', () => {
    function App() {
      return [ 'try',
        [ 'if', 'invalidCondition', [ 'p', 'hello' ] ],
        err => [ 'p', err.message ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Invalid if template</p>' );
  } );

  test( 'component throwing error', () => {
    function App() {
      return [ 'try',
        [ ThrowError ],
        err => [ 'p', err.message ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'empty placeholder', () => {
    function App() {
      return [ 'try',
        [ ThrowError ],
        () => {},
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );
  } );

  test( 'reactive property', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ 'p', fruit.name ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>apple</p>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'reactive in component', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ Component ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    function Component() {
      reactive( fruit.name, () => {} );

      return [ 'p', 'OK' ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>OK</p>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'component inside if', () => {
    const [ condition, setCondition ] = state( false );

    function App() {
      return [ 'try',
        [ 'if', condition, [ ThrowError ] ],
        err => [ 'p', err.message ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'initial component inside if', () => {
    const [ condition, ] = state( true );

    function App() {
      return [ 'try',
        [ 'if', condition, [ ThrowError ] ],
        err => [ 'p', err.message ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'component inside switch', () => {
    const [ condition, setCondition ] = state( false );

    function App() {
      return [ 'try',
        [ 'switch',
          [ 'if', condition, [ ThrowError ] ],
          [ 'else', [ 'p', 'OK' ] ],
        ],
        err => [ 'p', err.message ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>OK</p>' );

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'initial component inside switch', () => {
    const [ condition, ] = state( true );

    function App() {
      return [ 'try',
        [ 'switch',
          [ 'if', condition, [ ThrowError ] ],
          [ 'else', [ 'p', 'OK' ] ],
        ],
        err => [ 'p', err.message ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'component inside dynamic', () => {
    const [ component, setComponent ] = state( Test );

    function App() {
      return [ 'try',
        [ 'dynamic', component ],
        err => [ 'p', err.message ],
      ];
    }

    function Test() {
      return [ 'p', 'test' ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setComponent( () => ThrowError );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'initial component inside dynamic', () => {
    const [ component, ] = state( ThrowError );

    function App() {
      return [ 'try',
        [ 'dynamic', component ],
        err => [ 'p', err.message ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'for directive', () => {
    const [ items, setItems ] = state( [ { fruit: { name: 'apple' }, count: 4 } ] );

    function App() {
      return [ 'try',
        [ 'for', items, item => [ 'div', item.fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setItems( mutate( items => items.push( { fruit: null, count: 6 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'initial for directive', () => {
    const [ items, ] = state( [ { fruit: null, count: 4 } ] );

    function App() {
      return [ 'try',
        [ 'for', items, item => [ 'div', item.fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'repeat directive', () => {
    const items = [ { name: 'apple' } ];

    const [ count, setCount ] = state( 1 );

    function App() {
      return [ 'try',
        [ 'repeat', count, index => [ 'div', items[ index ].name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setCount( 2 );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'null repeat counter', () => {
    const [ count, setCount ] = state( { value: 1 } );

    function App() {
      return [ 'try',
        [ 'repeat', count.value, index => [ 'div', index ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>0</div>' );

    setCount( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'null initial repeat counter', () => {
    const [ count, ] = state( null );

    function App() {
      return [ 'try',
        [ 'repeat', count.value, index => [ 'div', index ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'invalid if condition', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'invalid initial if condition', () => {
    const [ fruit, ] = state( null );

    function App() {
      return [ 'try',
        [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'invalid switch condition', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ 'switch',
          [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
          [ 'else', [ 'p', 'not apple' ] ],
        ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'invalid initial switch condition', () => {
    const [ fruit, ] = state( null );

    function App() {
      return [ 'try',
        [ 'switch',
          [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
          [ 'else', [ 'p', 'not apple' ] ],
        ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'invalid for item', () => {
    const [ items, setItems ] = state( [ { fruit: { name: 'apple' }, count: 4 } ] );

    function App() {
      return [ 'try',
        [ 'for', items, item => [ 'div', item.fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setItems( mutate( items => items.push( { fruit: null, count: 6 } ) ) );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'null for items', () => {
    const [ items, setItems ] = state( [ { fruit: { name: 'apple' }, count: 4 } ] );

    function App() {
      return [ 'try',
        [ 'for', items, item => [ 'div', item.fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setItems( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'null initial for items', () => {
    const [ items, ] = state( null );

    function App() {
      return [ 'try',
        [ 'for', items, item => [ 'div', item.fruit.name ] ],
        () => [ 'p', 'Something went wrong' ],
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );

  test( 'multiple errors', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    const callback = vi.fn( () => {
      return [ 'p', 'Something went wrong' ];
    } );

    function App() {
      return [ 'try',
        [[
          [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
          [ 'if', () => fruit.name() == 'orange', [ 'div', fruit.name ] ],
        ]],
        callback,
      ];
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div><!---->' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'throw error in error handler', () => {
    function App() {
      return [ 'try',
        [ ThrowError ],
        ThrowError,
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    expect( () => {
      createApp( App ).mount( document.body );
    } ).toThrowError( 'Something went wrong' );
  } );

  test( 'throw error in error placeholder', () => {
    function App() {
      return [ 'try',
        [ ThrowError ],
        () => [ ThrowError ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    expect( () => {
      createApp( App ).mount( document.body );
    } ).toThrowError( 'Something went wrong' );
  } );

  test( 'handle error in innermost handler', () => {
    const [ component, setComponent ] = state( Test );

    function App() {
      return [ 'try',
        [ 'dynamic', component ],
        () => [ 'p', 'outer handler' ],
      ];
    }

    function Test() {
      return [ 'p', 'test' ];
    }

    function BadComponent() {
      return [ 'try',
        [ ThrowError ],
        () => [ 'p', 'inner handler' ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>test</p>' );

    setComponent( () => BadComponent );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>inner handler</p>' );
  } );


  test( 'pass handler error to parent handler', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ 'try',
          [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
          ThrowError,
        ],
        () => [ 'p', 'parent handler' ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>parent handler</p>' );
  } );

  test( 'pass placeholder error to parent handler', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ 'try',
          [ ThrowError ],
          () => [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
        ],
        () => [ 'p', 'parent handler' ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>parent handler</p>' );
  } );

  test( 'pass initial placeholder error to parent handler', () => {
    const [ fruit, setFruit ] = state( { name: 'apple' } );

    function App() {
      return [ 'try',
        [ 'try',
          [ 'if', () => fruit.name() == 'apple', [ 'div', fruit.name ] ],
          () => [ ThrowError ],
        ],
        () => [ 'p', 'parent handler' ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<div>apple</div>' );

    setFruit( null );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>parent handler</p>' );
  } );

  test( 'pass initial callback error to parent handler', () => {
    function App() {
      return [ 'try',
        [ 'try',
          [ ThrowError ],
          ThrowError,
        ],
        () => [ 'p', 'parent handler' ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>parent handler</p>' );
  } );

  test( 'pass initial placeholder error to parent handler', () => {
    function App() {
      return [ 'try',
        [ 'try',
          [ ThrowError ],
          () => [ ThrowError ],
        ],
        () => [ 'p', 'parent handler' ],
      ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>parent handler</p>' );
  } );

  test( 'destroy component throwing error', () => {
    const [ condition, setCondition ] = state( false );

    const mountCallback = vi.fn();
    const destroyCallback = vi.fn();

    function App() {
      return [ 'try',
        [ Component ],
        err => [ 'p', err.message ],
      ];
    }

    function Component() {
      onMount( mountCallback );
      onDestroy( destroyCallback );

      return [ 'if', condition, [ ThrowError ] ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<!---->' );

    expect( mountCallback ).toHaveBeenCalledOnce();
    expect( destroyCallback ).not.toHaveBeenCalled();

    setCondition( true );

    runSchedule();

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );

    expect( destroyCallback ).toHaveBeenCalledOnce();
  } );

  test( 'do not destroy not mounted component', () => {
    const mountCallback = vi.fn();
    const destroyCallback = vi.fn();

    function App() {
      return [ 'try',
        [ Component ],
        err => [ 'p', err.message ],
      ];
    }

    function Component() {
      onMount( mountCallback );
      onDestroy( destroyCallback );

      return [ ThrowError ];
    }

    function ThrowError() {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );

    expect( mountCallback ).not.toHaveBeenCalled();
    expect( destroyCallback ).not.toHaveBeenCalled();
  } );

  test( 'error thrown by event handler', () => {
    const [ button, setButton ] = state( null );

    function App() {
      return [ 'try',
        [ 'button', { ref: setButton, type: 'button', onclick: throwError } ],
        err => [ 'p', err.message ],
      ];
    }

    function throwError( e ) {
      throw new Error( 'Something went wrong' );
    }

    createApp( App ).mount( document.body );

    expect( document.body.innerHTML ).toBe( '<button type="button"></button>' );

    const event = new MouseEvent( 'click' );

    button().dispatchEvent( event );

    expect( document.body.innerHTML ).toBe( '<p>Something went wrong</p>' );
  } );
} );
