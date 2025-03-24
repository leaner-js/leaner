import { describe, expect, test, vi } from 'vitest';
import { computed, constant, destroyScope, mutate, state, watch, withScope } from 'leaner';

describe( 'computed()', () => {
  test( 'simple value', () => {
    const [ getValue, setValue ] = state( 4 );

    const getComputed = computed( () => getValue() + 3 );

    expect( getComputed ).toBeTypeOf( 'function' );

    expect( getComputed() ).toBe( 7 );

    setValue( 10 );

    expect( getComputed() ).toBe( 13 );
  } );

  test( 'array.filter()', () => {
    const [ getValue, ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const initialValue = getValue()[ 1 ];

    const getComputed = computed( () => getValue().filter( i => i.count > 5 ) );

    const value = getComputed();

    expect( value ).toHaveLength( 1 );
    expect( value[ 0 ] ).toBe( initialValue );
  } );

  test( 'array.filter() updated', () => {
    const [ getValue, setValue ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const getComputed = computed( () => getValue().filter( i => i.count > 5 ) );

    expect( getComputed() ).toEqual( [ { name: 'oranges', count: 7 } ] );

    setValue( mutate( state => state[ 0 ].count = 10 ) );

    expect( getComputed() ).toEqual( [ { name: 'apples', count: 10 }, { name: 'oranges', count: 7 } ] );
  } );

  test( 'calculated on demand', () => {
    const [ getValue, ] = state( 4 );

    const callback = vi.fn().mockImplementation( () => getValue() + 3 );

    const getComputed = computed( callback );

    expect( callback ).not.toHaveBeenCalled();

    getComputed();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'calculated only once', () => {
    const [ getValue, ] = state( 4 );

    const callback = vi.fn().mockImplementation( () => getValue() + 3 );

    const getComputed = computed( callback );

    getComputed();

    expect( callback ).toHaveBeenCalledOnce();

    getComputed();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'recalculated on demand', () => {
    const [ getValue, setValue ] = state( 4 );

    const callback = vi.fn().mockImplementation( () => getValue() + 3 );

    const getComputed = computed( callback );

    getComputed();

    callback.mockClear();

    setValue( 10 );

    expect( callback ).not.toHaveBeenCalled();

    getComputed();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'value is readonly', () => {
    const [ getValue, ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const getComputed = computed( () => getValue().filter( i => i.count > 5 ) );

    const value = getComputed();

    expect( () => {
      value[ 0 ].name = 'peaches';
    } ).toThrowError( 'not allowed' );
  } );

  test( 'getter chaining', () => {
    const [ getValue, setValue ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const getComputed = computed( () => getValue().filter( i => i.count > 5 ) );

    const name = getComputed[ 0 ].name;

    expect( name() ).toBe( 'oranges' );

    setValue( mutate( state => state[ 0 ].count = 10 ) );

    expect( name() ).toBe( 'apples' );
  } );

  test( 'throws error when scope destroyed', () => {
    const [ getValue, ] = state( 4 );

    const callback = vi.fn().mockImplementation( () => getValue() + 3 );

    const scope = [];

    const getComputed = withScope( scope, () => {
      return computed( callback );
    } );

    getComputed();

    expect( callback ).toHaveBeenCalledOnce();

    destroyScope( scope );

    expect( getComputed ).toThrowError( 'destroyed' );
  } );

  test( 'watch a computed value', () => {
    const [ getValue, setValue ] = state( 4 );

    const getComputed = computed( () => getValue() + 3 );

    const callback = vi.fn();

    watch( getComputed, callback );

    expect( callback ).not.toHaveBeenCalled();

    setValue( 10 );

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );

describe( 'constant()', () => {
  test( 'simple value', () => {
    const getConstant = constant( 4 );

    expect( getConstant ).toBeTypeOf( 'function' );

    expect( getConstant() ).toBe( 4 );
  } );

  test( 'object', () => {
    const getConstant = constant( { name: 'apples', count: 4 } );

    expect( getConstant() ).toEqual( { name: 'apples', count: 4 } );
  } );

  test( 'value is readonly', () => {
    const getConstant = constant( { name: 'apples', count: 4 } );

    const value = getConstant();

    expect( () => {
      value.name = 'peaches';
    } ).toThrowError( 'not allowed' );
  } );

  test( 'getter chaining', () => {
    const getConstant = constant( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const name = getConstant[ 0 ].name;

    expect( name() ).toBe( 'apples' );
  } );
} );
