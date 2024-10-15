import { describe, expect, test, vi } from 'vitest';
import { get, getter, state, transform } from 'leaner';

describe( 'transform()', () => {
  test( 'with constant', () => {
    const value = 'plus';

    const result = transform( value, value => 'i-' + value );

    expect( result ).toBe( 'i-plus' );
  } );

  test( 'with state getter', () => {
    const [ getValue, setValue ] = state( 'plus' );

    const result = transform( getValue, value => 'i-' + value );

    expect( result ).toBeTypeOf( 'function' );

    expect( result() ).toBe( 'i-plus' );

    setValue( 'minus' );

    expect( result() ).toBe( 'i-minus' );
  } );
} );

describe( 'get()', () => {
  test( 'with constant', () => {
    const result = get( 5 );

    expect( result ).toBe( 5 );
  } );

  test( 'with function', () => {
    const callback = vi.fn().mockImplementation( () => 5 );

    const result = get( callback );

    expect( result ).toBe( 5 );

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );

describe( 'getter()', () => {
  test( 'with constant', () => {
    const result = getter( 5 );

    expect( result ).toBeTypeOf( 'function' );

    expect( result() ).toBe( 5 );
  } );

  test( 'with function', () => {
    const callback = vi.fn().mockImplementation( () => 5 );

    const result = getter( callback );

    expect( result ).toBeTypeOf( 'function' );

    expect( result() ).toBe( 5 );

    expect( callback ).toHaveBeenCalledOnce();
  } );
} );
