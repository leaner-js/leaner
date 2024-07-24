import { describe, expect, test, vi } from 'vitest';
import { state, transform } from 'leaner';

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
