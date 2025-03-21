import { describe, expect, test, vi } from 'vitest';
import { state } from 'leaner';
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
    const element = make( [ 'label', { for: 'test' }, 'hello' ] );

    expect( element ).toBeInstanceOf( HTMLLabelElement );
    expect( element.outerHTML ).toBe( '<label for="test">hello</label>' );
  } );

  test( 'HTML element with property', () => {
    const element = make( [ 'label', { textContent: 'hello' } ] );

    expect( element ).toBeInstanceOf( HTMLLabelElement );
    expect( element.outerHTML ).toBe( '<label>hello</label>' );
  } );

  test( 'dynamic value', () => {
    const [ value, setValue ] = state( 'test' );

    const element = make( [ 'input', { value } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.value ).toBe( 'test' );

    setValue( 'hello' );

    runSchedule();

    expect( element.value ).toBe( 'hello' );
  } );

  test( 'undefined value', () => {
    const element = make( [ 'input', { value: undefined } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.value ).toBe( '' );
  } );

  test( 'dynamic content', () => {
    const [ value, setValue ] = state( 'test' );

    const element = make( [ 'p', value ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'test' );

    setValue( 'hello' );

    runSchedule();

    expect( element.textContent ).toBe( 'hello' );
  } );

  test( 'undefined content', () => {
    const element = make( [ 'p', undefined ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( '' );
  } );

  test( 'dynamic attribute', () => {
    const [ value, setValue ] = state( 'test' );

    const element = make( [ 'label', { for: value }, 'hello' ] );

    expect( element ).toBeInstanceOf( HTMLLabelElement );
    expect( element.outerHTML ).toBe( '<label for="test">hello</label>' );

    setValue( 'world' );

    runSchedule();

    expect( element.outerHTML ).toBe( '<label for="world">hello</label>' );
  } );

  test( 'undefined attribute', () => {
    const element = make( [ 'label', { for: undefined }, 'hello' ] );

    expect( element ).toBeInstanceOf( HTMLLabelElement );
    expect( element.outerHTML ).toBe( '<label>hello</label>' );
  } );

  test( 'remove attribute', () => {
    const [ value, setValue ] = state( 'test' );

    const element = make( [ 'label', { for: value }, 'hello' ] );

    expect( element ).toBeInstanceOf( HTMLLabelElement );
    expect( element.outerHTML ).toBe( '<label for="test">hello</label>' );

    setValue( null );

    runSchedule();

    expect( element.outerHTML ).toBe( '<label>hello</label>' );
  } );

  test( 'boolean attribute', () => {
    const [ value, setValue ] = state( true );

    const element = make( [ 'input', { type: 'text', readonly: value } ] );

    expect( element ).toBeInstanceOf( HTMLInputElement );
    expect( element.outerHTML ).toBe( '<input type="text" readonly="">' );

    setValue( false );

    runSchedule();

    expect( element.outerHTML ).toBe( '<input type="text">' );
  } );

  test( 'enumerated attribute', () => {
    const [ value, setValue ] = state( true );

    const element = make( [ 'div', { 'aria-hidden': value }, 'hello' ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.outerHTML ).toBe( '<div aria-hidden="true">hello</div>' );

    setValue( false );

    runSchedule();

    expect( element.outerHTML ).toBe( '<div aria-hidden="false">hello</div>' );
  } );

  test( 'multiple text nodes', () => {
    const [ value, setValue ] = state( 'test' );

    const element = make( [ 'p', 'This is a ', value, '.' ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'This is a test.' );

    setValue( 'hello' );

    runSchedule();

    expect( element.textContent ).toBe( 'This is a hello.' );
  } );

  test( 'null text node', () => {
    const [ value, setValue ] = state( 'test' );

    const element = make( [ 'p', 'This is a ', value, '.' ] );

    expect( element ).toBeInstanceOf( HTMLElement );
    expect( element.textContent ).toBe( 'This is a test.' );

    setValue( null );

    runSchedule();

    expect( element.textContent ).toBe( 'This is a .' );
  } );

  test( 'child fragment', () => {
    const [ value, setValue ] = state( 'test' );

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
    const [ value, setValue ] = state();

    const element = make( [ 'input', { name: 'test', ref: setValue } ] );

    expect( value() ).toBe( element );
  } );

  test( 'select with value', () => {
    const element = make( [ 'select', { value: '2' },
      [ 'option', { value: '1' }, 'One' ],
      [ 'option', { value: '2' }, 'Two' ],
    ] );

    expect( element.value ).toBe( '2' );
  } );
} );
