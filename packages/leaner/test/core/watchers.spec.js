import { describe, expect, test, vi } from 'vitest';
import { destroyScope, effect, mutate, reactive, state, watch, withScope } from 'leaner';
import { runSchedule } from 'leaner/schedule.js';

describe( 'watch()', () => {
  test( 'callback not called immediately', () => {
    const getter = vi.fn();
    const callback = vi.fn();

    watch( getter, callback );

    expect( getter ).toHaveBeenCalledOnce();
    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'called synchronously after change', () => {
    const [ getValue, setValue ] = state( 'apples' );

    const callback = vi.fn();

    watch( getValue, callback );

    setValue( 'oranges' );

    expect( callback ).toHaveBeenCalledWith( 'oranges', 'apples' );
  } );

  test( 'only called when explicit dependency changes', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    watch( getValue.count, callback );

    setValue( mutate( state => state.name = 'oranges' ) );

    expect( callback ).not.toHaveBeenCalled();

    setValue( mutate( state => state.count = 7 ) );

    expect( callback ).toHaveBeenCalledWith( 7, 4 );
  } );

  test( 'not called if value is the same', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn();

    watch( getValue.name, callback );

    setValue( { name: 'apples', count: 7 } );

    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'called when parent dependency changes', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn();

    watch( getValue.name, callback );

    setValue( { name: 'oranges', count: 7 } );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'not called when child dependency changes', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn();

    watch( getValue, callback );

    setValue( mutate( state => state.name = 'oranges' ) );

    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'not called when scope destroyed', () => {
    const [ getValue, setValue ] = state( 'apples' );

    const callback = vi.fn();

    const scope = [];

    withScope( scope, () => {
      watch( getValue, callback );
    } );

    callback.mockClear();

    destroyScope( scope );

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'mutate value in callback', () => {
    const [ getValue, setValue ] = state( 1 );

    const callback = vi.fn().mockImplementation( updateValue );

    function updateValue( value ) {
      if ( value == 2 )
        setValue( 3 );
    }

    watch( getValue, callback );

    setValue( 2 );

    expect( callback ).toHaveBeenCalled();
    expect( getValue() ).toBe( 3 );

    setValue( 2 );

    expect( callback ).toHaveBeenCalled();
    expect( getValue() ).toBe( 3 );
  } );
} );

describe( 'effect()', () => {
  test( 'called asynchronously', () => {
    const callback = vi.fn();

    effect( callback );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called asynchronously after change', () => {
    const [ getValue, setValue ] = state( 'apples' );

    const callback = vi.fn().mockImplementation( getValue );

    effect( callback );

    runSchedule();

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called only once after multiple changes', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    effect( callback );

    runSchedule();

    callback.mockClear();

    setValue( { name: 'oranges', count: 7 } );
    setValue( mutate( state => state.name = 'peaches' ) );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );

describe( 'reactive()', () => {
  test( 'callback called immediately', () => {
    const getter = vi.fn().mockReturnValue( 'apples' );
    const callback = vi.fn();

    reactive( getter, callback );

    expect( getter ).toHaveBeenCalledOnce();
    expect( callback ).toHaveBeenCalledOnce();
    expect( callback ).toHaveBeenCalledWith( 'apples', undefined );
  } );

  test( 'called asynchronously after change', () => {
    const [ getValue, setValue ] = state( 'apples' );

    const callback = vi.fn();

    reactive( getValue, callback );

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledWith( 'oranges', 'apples' );
  } );

  test( 'only called when explicit dependency changes', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    reactive( getValue.count, callback );

    callback.mockClear();

    setValue( mutate( state => state.name = 'oranges' ) );

    runSchedule();

    expect( callback ).not.toHaveBeenCalled();

    setValue( mutate( state => state.count = 7 ) );

    runSchedule();

    expect( callback ).toHaveBeenCalledWith( 7, 4 );
  } );

  test( 'not called if value is the same', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    const callback = vi.fn();

    reactive( getValue.name, callback );

    callback.mockClear();

    setValue( { name: 'apples', count: 7 } );

    runSchedule();

    expect( callback ).not.toHaveBeenCalled();
  } );
} );
