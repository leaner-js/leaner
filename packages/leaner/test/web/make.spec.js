import { describe, expect, test, vi } from 'vitest';
import { useState } from 'leaner';
import { make } from 'leaner/web/make.js';
import { runSchedule } from 'leaner/schedule.js';

describe( 'make()', () => {
  test( 'simple HTML element', () => {
    const element = make( [ 'input', { name: 'test' } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.name ).toBe( 'test' );
  } );

  test( 'HTML element with content', () => {
    const element = make( [ 'p', 'hello' ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'hello' );
  } );

  test( 'HTML element with attribute', () => {
    const element = make( [ 'input', { 'aria-describedby': 'test' } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.outerHTML ).toBe( '<input aria-describedby="test">' );
  } );

  test( 'dynamic value', () => {
    const [ value, setValue ] = useState( 'test' );

    const element = make( [ 'input', { value } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.value ).toBe( 'test' );

    setValue( 'hello' );

    runSchedule();

    expect( element.value ).toBe( 'hello' );
  } );

  test( 'dynamic content', () => {
    const [ value, setValue ] = useState( 'test' );

    const element = make( [ 'p', value ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'test' );

    setValue( 'hello' );

    runSchedule();

    expect( element.textContent ).toBe( 'hello' );
  } );

  test( 'dynamic attribute', () => {
    const [ value, setValue ] = useState( 'test' );

    const element = make( [ 'input', { 'aria-describedby': value } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.outerHTML ).toBe( '<input aria-describedby="test">' );

    setValue( 'hello' );

    runSchedule();

    expect( element.outerHTML ).toBe( '<input aria-describedby="hello">' );
  } );

  test( 'multiple children', () => {
    const [ value, setValue ] = useState( 'test' );

    const element = make( [ 'p', 'This is a ', value, '.' ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'This is a test.' );

    setValue( 'hello' );

    runSchedule();

    expect( element.textContent ).toBe( 'This is a hello.' );
  } );

  test( 'child fragment', () => {
    const [ value, setValue ] = useState( 'test' );

    const element = make( [ 'p', [[ 'This is a ', value, '.' ]] ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'This is a test.' );

    setValue( 'hello' );

    runSchedule();

    expect( element.textContent ).toBe( 'This is a hello.' );
  } );

  test( 'event handler', () => {
    const handler = vi.fn();

    const element = make( [ 'button', { type: 'button', onclick: handler } ] );

    const event = new MouseEvent( 'click' );

    element.dispatchEvent( event );

    expect( handler ).toHaveBeenCalledWith( event );
  } );

  test( 'ref property', () => {
    const [ value, setValue ] = useState();

    const element = make( [ 'input', { name: 'test', ref: setValue } ] );

    expect( value() ).toBe( element );
  } );
} );
