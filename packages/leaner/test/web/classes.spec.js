import { describe, expect, test } from 'vitest';
import { state } from 'leaner';
import { make } from 'leaner/web/make.js';
import { runSchedule } from 'leaner/schedule.js';

describe( 'classes', () => {
  test( 'static value', () => {
    const element = make( [ 'button', { type: 'button', class: 'btn-primary is-large' } ] );

    expect( element.className ).toBe( 'btn-primary is-large' );
  } );

  test( 'undefined', () => {
    const element = make( [ 'button', { type: 'button', class: undefined } ] );

    expect( element.outerHTML ).toBe( '<button type="button"></button>' );
  } );

  test( 'static array', () => {
    const element = make( [ 'button', { type: 'button', class: [ 'btn-primary', 'is-large' ] } ] );

    expect( element.className ).toBe( 'btn-primary is-large' );
  } );

  test( 'static array with undefined', () => {
    const element = make( [ 'button', { type: 'button', class: [ 'btn-primary', 'is-large', undefined ] } ] );

    expect( element.className ).toBe( 'btn-primary is-large' );
  } );

  test( 'dynamic value', () => {
    const [ value, setValue ] = state( 'btn-primary' );

    const element = make( [ 'button', { type: 'button', class: value } ] );

    expect( element.className ).toBe( 'btn-primary' );

    setValue( 'btn-primary is-large' );

    runSchedule();

    expect( element.className ).toBe( 'btn-primary is-large' );
  } );

  test( 'dynamic array', () => {
    const [ value, setValue ] = state( 'btn-primary' );

    const element = make( [ 'button', { type: 'button', class: [ value, 'is-large' ] } ] );

    expect( element.className ).toBe( 'btn-primary is-large' );

    setValue( 'btn-secondary' );

    runSchedule();

    expect( element.className ).toBe( 'btn-secondary is-large' );
  } );

  test( 'dynamic object', () => {
    const [ value, setValue ] = state( false );

    const element = make( [ 'button', { type: 'button', class: { 'is-large': value } } ] );

    expect( element.className ).toBe( '' );

    setValue( true );

    runSchedule();

    expect( element.className ).toBe( 'is-large' );
  } );

  test( 'dynamic array and object', () => {
    const [ value, setValue ] = state( 'btn-primary' );
    const [ large, setLarge ] = state( false );

    const element = make( [ 'button', { type: 'button', class: [ value, { 'is-large': large } ] } ] );

    expect( element.className ).toBe( 'btn-primary' );

    setValue( 'btn-secondary' );
    setLarge( true );

    runSchedule();

    expect( element.className ).toBe( 'btn-secondary is-large' );
  } );
} );
