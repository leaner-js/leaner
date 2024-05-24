import { describe, expect, test, vi } from 'vitest';
import { destroyScope, mutate, useEffect, useReactive, useReactiveWatch, useState, useWatch, useWatchEffect, withScope } from 'leaner';
import { runSchedule } from 'leaner/schedule.js';

describe( 'useWatchEffect()', () => {
  test( 'called immediately', () => {
    const callback = vi.fn();

    useWatchEffect( callback );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called synchronously after change', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn().mockImplementation( getValue );

    useWatchEffect( callback );

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called when parent dependency changes', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    useWatchEffect( callback );

    callback.mockClear();

    setValue( { name: 'oranges', count: 7 } );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'not called when child dependency changes', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue );

    useWatchEffect( callback );

    callback.mockClear();

    setValue( mutate( state => state.name = 'oranges' ) );

    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'not called when scope destroyed', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn().mockImplementation( getValue );

    const scope = [];

    withScope( scope, () => {
      useWatchEffect( callback );
    } );

    callback.mockClear();

    destroyScope( scope );

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();
  } );
} );

describe( 'useWatch()', () => {
  test( 'callback not called immediately', () => {
    const getter = vi.fn();
    const callback = vi.fn();

    useWatch( getter, callback );

    expect( getter ).toHaveBeenCalledOnce();
    expect( callback ).not.toHaveBeenCalled();
  } );

  test( 'called synchronously after change', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn();

    useWatch( getValue, callback );

    setValue( 'oranges' );

    expect( callback ).toHaveBeenCalledWith( 'oranges', 'apples' );
  } );

  test( 'only called when explicit dependency changes', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    useWatch( getValue.count, callback );

    setValue( mutate( state => state.name = 'oranges' ) );

    expect( callback ).not.toHaveBeenCalled();

    setValue( mutate( state => state.count = 7 ) );

    expect( callback ).toHaveBeenCalledWith( 7, 4 );
  } );

  test( 'not called if value is the same', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn();

    useWatch( getValue.name, callback );

    setValue( { name: 'apples', count: 7 } );

    expect( callback ).not.toHaveBeenCalled();
  } );
} );

describe( 'useEffect()', () => {
  test( 'called asynchronously', () => {
    const callback = vi.fn();

    useEffect( callback );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called asynchronously after change', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn().mockImplementation( getValue );

    useEffect( callback );

    runSchedule();

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called only once after multiple changes', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    useEffect( callback );

    runSchedule();

    callback.mockClear();

    setValue( { name: 'oranges', count: 7 } );
    setValue( mutate( state => state.name = 'peaches' ) );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );

describe( 'useReactive()', () => {
  test( 'called immediately', () => {
    const callback = vi.fn();

    useReactive( callback );

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called asynchronously after change', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn().mockImplementation( getValue );

    useReactive( callback );

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'not called when scope destroyed', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn().mockImplementation( getValue );

    const scope = [];

    withScope( scope, () => {
      useReactive( callback );
    } );

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();

    destroyScope( scope );

    runSchedule();

    expect( callback ).not.toHaveBeenCalledOnce();
  } );
} );

describe( 'useReactiveWatch()', () => {
  test( 'callback called immediately', () => {
    const getter = vi.fn();
    const callback = vi.fn();

    useReactiveWatch( getter, callback );

    expect( getter ).toHaveBeenCalledOnce();
    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'called asynchronously after change', () => {
    const [ getValue, setValue ] = useState( 'apples' );

    const callback = vi.fn();

    useReactiveWatch( getValue, callback );

    callback.mockClear();

    setValue( 'oranges' );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalledWith( 'oranges', 'apples' );
  } );

  test( 'only called when explicit dependency changes', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn().mockImplementation( getValue.name );

    useReactiveWatch( getValue.count, callback );

    callback.mockClear();

    setValue( mutate( state => state.name = 'oranges' ) );

    runSchedule();

    expect( callback ).not.toHaveBeenCalled();

    setValue( mutate( state => state.count = 7 ) );

    runSchedule();

    expect( callback ).toHaveBeenCalledWith( 7, 4 );
  } );

  test( 'not called if value is the same', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const callback = vi.fn();

    useReactiveWatch( getValue.name, callback );

    callback.mockClear();

    setValue( { name: 'apples', count: 7 } );

    runSchedule();

    expect( callback ).not.toHaveBeenCalled();
  } );
} );
