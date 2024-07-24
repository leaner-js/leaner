import { describe, expect, test } from 'vitest';
import { mutate, state } from 'leaner';

describe( 'mutate()', () => {
  test( 'set object property', () => {
    const [ getValue, setValue ] = state( { name: 'apples', count: 4 } );

    setValue( mutate( value => {
      value.count = value.count + 3;
    } ) );

    const value = getValue();

    expect( value ).toEqual( { name: 'apples', count: 7 } );
  } );

  test( 'set array item', () => {
    const [ getValue, setValue ] = state( [ { name: 'apples', count: 4 } ] );

    setValue( mutate( value => {
      value[ 0 ] = { name: 'oranges', count: 7 };
    } ) );

    const value = getValue();

    expect( value ).toEqual( [ { name: 'oranges', count: 7 } ] );
  } );

  test( 'array.push()', () => {
    const [ getValue, setValue ] = state( [ { name: 'apples', count: 4 } ] );

    const initialValue = getValue()[ 0 ];

    setValue( mutate( value => {
      value.push( { name: 'oranges', count: 7 } );
    } ) );

    const value = getValue();

    expect( value ).toHaveLength( 2 );
    expect( value[ 0 ] ).toBe( initialValue );
    expect( value[ 1 ] ).toEqual( { name: 'oranges', count: 7 } );
  } );

  test( 'array.unshift()', () => {
    const [ getValue, setValue ] = state( [ { name: 'apples', count: 4 } ] );

    const initialValue = getValue()[ 0 ];

    setValue( mutate( value => {
      value.unshift( { name: 'oranges', count: 7 } );
    } ) );

    const value = getValue();

    expect( value ).toHaveLength( 2 );
    expect( value[ 0 ] ).toEqual( { name: 'oranges', count: 7 } );
    expect( value[ 1 ] ).toBe( initialValue );
  } );

  test( 'array.splice()', () => {
    const [ getValue, setValue ] = state( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const initialValue = getValue()[ 1 ];

    setValue( mutate( value => {
      value.splice( 0, 1 );
    } ) );

    const value = getValue();

    expect( value ).toHaveLength( 1 );
    expect( value[ 0 ] ).toBe( initialValue );
  } );

  test( 'array.filter() with property', () => {
    const [ getValue, setValue ] = state( { fruits: [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] } );

    const initialValue = getValue().fruits[ 1 ];

    setValue( mutate( value => {
      value.fruits = value.fruits.filter( i => i.count > 5 );
    } ) );

    const value = getValue();

    expect( value.fruits ).toHaveLength( 1 );
    expect( value.fruits[ 0 ] ).toBe( initialValue );
  } );
} );
