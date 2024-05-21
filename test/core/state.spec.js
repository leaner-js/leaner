import { describe, expect, test } from 'vitest';
import { useState } from 'leaner';

describe( 'useState()', () => {
  test( 'get simple value', () => {
    const [ getValue, ] = useState( 'apple' );

    expect( getValue ).toBeTypeOf( 'function' );

    const value = getValue();

    expect( value ).toBe( 'apple' );
  } );

  test( 'set simple value', () => {
    const [ getValue, setValue ] = useState( 'apple' );

    expect( setValue ).toBeTypeOf( 'function' );

    setValue( 'orange' )

    const value = getValue();

    expect( value ).toBe( 'orange' );
  } );

  test( 'get an object', () => {
    const [ getValue, ] = useState( { name: 'apples', count: 4 } );

    const value = getValue();

    expect( value ).toEqual( { name: 'apples', count: 4 } );
  } );

  test( 'set an object', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    setValue( { name: 'oranges', count: 7 } );

    const value = getValue();

    expect( value ).toEqual( { name: 'oranges', count: 7 } );
  } );

  test( 'state is readonly', () => {
    const [ getValue, ] = useState( { name: 'apples', count: 4 } );

    const value = getValue();

    expect( () => {
      value.name = 'oranges';
    } ).toThrowError( 'not allowed' );
  } );

  test( 'increment simple value', () => {
    const [ getValue, setValue ] = useState( 4 );

    setValue( value => value + 3 );

    const value = getValue();

    expect( value ).toBe( 7 );
  } );

  test( 'concatenate array', () => {
    const [ getValue, setValue ] = useState( [ { name: 'apples', count: 4 } ] );

    const initialValue = getValue()[ 0 ];

    setValue( value => [ ...value, { name: 'oranges', count: 7 } ] );

    const value = getValue();

    expect( value ).toHaveLength( 2 );
    expect( value[ 0 ] ).toBe( initialValue );
    expect( value[ 1 ] ).toEqual( { name: 'oranges', count: 7 } );
  } );

  test( 'array.filter()', () => {
    const [ getValue, setValue ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );

    const initialValue = getValue()[ 1 ];

    setValue( value => value.filter( i => i.count > 5 ) );

    const value = getValue();

    expect( value ).toHaveLength( 1 );
    expect( value[ 0 ] ).toBe( initialValue );
  } );

  test( 'value in setter is readonly', () => {
    const [ , setValue ] = useState( { name: 'apples', count: 4 } );

    expect( () => {
      setValue( value => {
        value.name = 'oranges';
      } );
    } ).toThrowError( 'not allowed' );
  } );

  test( 'getter chaining with object', () => {
    const [ getValue, setValue ] = useState( { name: 'apples', count: 4 } );

    const name = getValue.name;
    const count = getValue.count;

    expect( name ).toBeTypeOf( 'function' );
    expect( count ).toBeTypeOf( 'function' );

    expect( name() ).toBe( 'apples' );
    expect( count() ).toBe( 4 );

    setValue( { name: 'oranges', count: 7 } );

    expect( name() ).toBe( 'oranges' );
    expect( count() ).toBe( 7 );
  } );

  test( 'getter chaining with array', () => {
    const [ getValue, setValue ] = useState( [ { name: 'apples', count: 4 } ] );

    const name = getValue[ 0 ].name;
    const count = getValue[ 0 ].count;

    expect( name ).toBeTypeOf( 'function' );
    expect( count ).toBeTypeOf( 'function' );

    expect( name() ).toBe( 'apples' );
    expect( count() ).toBe( 4 );

    setValue( [ { name: 'oranges', count: 7 } ] );

    expect( name() ).toBe( 'oranges' );
    expect( count() ).toBe( 7 );
  } );

  test( 'getter chaining with get()', () => {
    const [ getValue, ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );
    const [ getIndex, setIndex ] = useState( 0 );

    const name = getValue.get( getIndex ).name;
    const count = getValue.get( getIndex ).count;

    expect( name ).toBeTypeOf( 'function' );
    expect( count ).toBeTypeOf( 'function' );

    expect( name() ).toBe( 'apples' );
    expect( count() ).toBe( 4 );

    setIndex( 1 );

    expect( name() ).toBe( 'oranges' );
    expect( count() ).toBe( 7 );
  } );

  test( 'getter cannot be used as index', () => {
    const [ getValue, ] = useState( [ { name: 'apples', count: 4 }, { name: 'oranges', count: 7 } ] );
    const [ getIndex, ] = useState( 0 );

    expect( () => getValue[ getIndex ].name ).toThrowError( 'not allowed' );
  } );
} );
