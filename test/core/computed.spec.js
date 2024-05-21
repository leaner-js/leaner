import { describe, expect, test, vi } from 'vitest';
import { mutate, useComputed, useConstant, useState } from 'leaner';

describe( 'useComputed()', () => {
  test( 'simple value', () => {
    const [ getValue, setValue ] = useState( 4 );

    const computed = useComputed( () => getValue() + 3 );

    expect( computed ).toBeTypeOf( 'function' );

    expect( computed() ).toBe( 7 );

    setValue( 10 );

    expect( computed() ).toBe( 13 );
  } );

  test( 'array.filter()', () => {
    const [ getValue, ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const initialValue = getValue()[ 1 ];

    const computed = useComputed( () => getValue().filter( i => i.count > 5 ) );

    const value = computed();

    expect( value ).toHaveLength( 1 );
    expect( value[ 0 ] ).toBe( initialValue );
  } );

  test( 'array.filter() updated', () => {
    const [ getValue, setValue ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const computed = useComputed( () => getValue().filter( i => i.count > 5 ) );

    expect( computed() ).toEqual( [ { name: 'oranges', count: 7 } ] );

    setValue( mutate( state => state[ 0 ].count = 10 ) );

    expect( computed() ).toEqual( [ { name: 'apples', count: 10 }, { name: 'oranges', count: 7 } ] );
  } );

  test( 'calculated on demand', () => {
    const [ getValue, ] = useState( 4 );

    function calculate() {
      return getValue() + 3;
    }

    const callback = vi.fn().mockImplementation( calculate );

    const computed = useComputed( callback );

    expect( callback ).not.toHaveBeenCalled();

    computed();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'calculated only once', () => {
    const [ getValue, ] = useState( 4 );

    function calculate() {
      return getValue() + 3;
    }

    const callback = vi.fn().mockImplementation( calculate );

    const computed = useComputed( callback );

    computed();

    expect( callback ).toHaveBeenCalledOnce();

    computed();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'recalculated on demand', () => {
    const [ getValue, setValue ] = useState( 4 );

    function calculate() {
      return getValue() + 3;
    }

    const callback = vi.fn().mockImplementation( calculate );

    const computed = useComputed( callback );

    computed();

    callback.mockClear();

    setValue( 10 );

    expect( callback ).not.toHaveBeenCalled();

    computed();

    expect( callback ).toHaveBeenCalledOnce();
  } );

  test( 'value is readonly', () => {
    const [ getValue, ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const computed = useComputed( () => getValue().filter( i => i.count > 5 ) );

    const value = computed();

    expect( () => {
      value[ 0 ].name = 'peaches';
    } ).toThrowError( 'not allowed' );
  } );

  test( 'getter chaining', () => {
    const [ getValue, setValue ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const computed = useComputed( () => getValue().filter( i => i.count > 5 ) );

    const name = computed[ 0 ].name;

    expect( name() ).toBe( 'oranges' );

    setValue( mutate( state => state[ 0 ].count = 10 ) );

    expect( name() ).toBe( 'apples' );
  } );
} );

describe( 'useConstant()', () => {
  test( 'simple value', () => {
    const constant = useConstant( 4 );

    expect( constant ).toBeTypeOf( 'function' );

    expect( constant() ).toBe( 4 );
  } );

  test( 'object', () => {
    const constant = useConstant( { name: 'apples', count: 4 } );

    expect( constant() ).toEqual( { name: 'apples', count: 4 } );
  } );

  test( 'value is readonly', () => {
    const constant = useConstant( { name: 'apples', count: 4 } );

    const value = constant();

    expect( () => {
      value.name = 'peaches';
    } ).toThrowError( 'not allowed' );
  } );

  test( 'getter chaining', () => {
    const constant = useConstant( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const name = constant[ 0 ].name;

    expect( name() ).toBe( 'apples' );
  } );
} );
