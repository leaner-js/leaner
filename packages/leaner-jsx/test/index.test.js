import { beforeEach, describe, expect, test, vi } from 'vitest';
import leanerJsx from 'leaner-jsx';

let plugin;

beforeEach( () => {
  plugin = leanerJsx();
  plugin.error = vi.fn().mockName( 'plugin.error' );
  plugin.warn = vi.fn().mockName( 'plugin.warn' );
} );

function transformCode( code ) {
  const result = plugin.transform( code, 'test.jsx' );
  expect( plugin.error ).not.toHaveBeenCalled();
  expect ( result ).toHaveProperty( 'code' );
  return result.code;
}

function transformError( code ) {
  const result = plugin.transform( code, 'test.jsx' );
  expect( plugin.error ).toHaveBeenCalled();
  expect( result ).toBeUndefined();
  return plugin.error;
}

describe( 'elements', () => {
  test( 'normal tag', () => {
    expect( transformCode( `<p>Test</p>` ) ).toBe( `[ 'p', 'Test' ]` );
  } );

  test( 'self-closing tag', () => {
    expect( transformCode( `<hr/>` ) ).toBe( `[ 'hr' ]` );
  } );

  test( 'tag with dash', () => {
    expect( transformCode( `<my-button>Test</my-button>` ) ).toBe( `[ 'my-button', 'Test' ]` );
  } );

  test( 'tag with namespace', () => {
    expect( transformError( `<ns:button>Test</ns:button>` ) ).toHaveBeenCalledWith( 'JSX namespaces are not supported (1:2)' );
  } );

  test( 'unbalanced tag', () => {
    expect( transformError( `<div>Test</p>` ) ).toHaveBeenCalledWith( 'Expected corresponding JSX closing tag for \'div\'.' );
  } );

  test( 'component', () => {
    expect( transformCode( `<MyButton>Test</MyButton>` ) ).toBe( `[ MyButton, 'Test' ]` );
  } );

  test( 'self-closing component', () => {
    expect( transformCode( `<MyButton/>` ) ).toBe( `[ MyButton ]` );
  } );

  test( 'component with dot', () => {
    expect( transformCode( `<MyButton.Content>Test</MyButton.Content>` ) ).toBe( `[ MyButton.Content, 'Test' ]` );
  } );

  test( 'fragment', () => {
    expect( transformCode( `<><p>One</p><p>Two</p></>` ) ).toBe( `[[ [ 'p', 'One' ], [ 'p', 'Two' ] ]]` );
  } );
} );

describe( 'attributes', () => {
  test( 'text attribute', () => {
    expect( transformCode( `<p id="para">Test</p>` ) ).toBe( `[ 'p', { id: 'para' }, 'Test' ]` );
  } );

  test( 'text attribute with entities', () => {
    expect( transformCode( `<p id="a &quot; b &#35; c &#x2BAD; d">Test</p>` ) ).toBe( `[ 'p', { id: 'a " b # c \u2BAD d' }, 'Test' ]` );
  } );

  test( 'text attribute with unknown entity', () => {
    expect( transformCode( `<p id="a &unknown; b">Test</p>` ) ).toBe( `[ 'p', { id: 'a &unknown; b' }, 'Test' ]` );
  } );

  test( 'text attribute with escaped characters', () => {
    expect( transformCode( `<p id="a ' b \n c \u2028 d">Test</p>` ) ).toBe( `[ 'p', { id: 'a \\' b \\n c \\u2028 d' }, 'Test' ]` );
  } );

  test( 'attribute with dash', () => {
    expect( transformCode( `<p aria-hidden="true">Test</p>` ) ).toBe( `[ 'p', { 'aria-hidden': 'true' }, 'Test' ]` );
  } );

  test( 'attribute with namespace', () => {
    expect( transformError( `<p ns:hidden="true">Test</p>` ) ).toHaveBeenCalledWith( 'JSX namespaces are not supported (1:4)' );
  } );

  test( 'boolean attribute', () => {
    expect( transformCode( `<p hidden>Test</p>` ) ).toBe( `[ 'p', { hidden: true }, 'Test' ]` );
  } );

  test( 'expression attribute', () => {
    expect( transformCode( `<p class={classes}>Test</p>` ) ).toBe( `[ 'p', { class: classes }, 'Test' ]` );
  } );

  test( 'expression attribute with the same name', () => {
    expect( transformCode( `<p style={style}>Test</p>` ) ).toBe( `[ 'p', { style }, 'Test' ]` );
  } );

  test( 'expression attribute with sequence', () => {
    expect( transformError( `<p style={foo, bar}>Test</p>` ) ).toHaveBeenCalledWith( 'JSX expressions may not use the comma operator' );
  } );

  test( 'multiple attributes', () => {
    expect( transformCode( `<p id="para" hidden class={classes} style={style}>Test</p>` ) ).toBe( `[ 'p', { id: 'para', hidden: true, class: classes, style }, 'Test' ]` );
  } );

  test( 'self-closing element with multiple attributes', () => {
    expect( transformCode( `<img src="image.png" hidden class={classes} style={style}/>` ) ).toBe( `[ 'img', { src: 'image.png', hidden: true, class: classes, style } ]` );
  } );

  test( 'spread attribute', () => {
    expect( transformCode( `<p {...attrs}>Test</p>` ) ).toBe( `[ 'p', attrs, 'Test' ]` );
  } );

  test( 'spread attribute with sequence', () => {
    expect( transformCode( `<p {...( foo, bar )}>Test</p>` ) ).toBe( `[ 'p', ( foo, bar ), 'Test' ]` );
  } );

  test( 'multiple attributes with spread', () => {
    expect( transformCode( `<p id="para" {...attrs} hidden>Test</p>` ) ).toBe( `[ 'p', { id: 'para', ...attrs, hidden: true }, 'Test' ]` );
  } );

  test( 'multiple attributes with spread sequence', () => {
    expect( transformCode( `<p id="para" {...( foo, bar )} hidden>Test</p>` ) ).toBe( `[ 'p', { id: 'para', ...( foo, bar ), hidden: true }, 'Test' ]` );
  } );
} );

describe( 'text', () => {
  test( 'simple text', () => {
    expect( transformCode( `<p>Test</p>` ) ).toBe( `[ 'p', 'Test' ]` );
  } );

  test( 'text with whitespace', () => {
    expect( transformCode( `<p> Test </p>` ) ).toBe( `[ 'p', ' Test ' ]` );
  } );

  test( 'text in separate line', () => {
    expect( transformCode( `<p>
      Test
    </p>` ) ).toBe( `[ 'p', 'Test' ]` );
  } );

  test( 'mulitple lines', () => {
    expect( transformCode( `<p>
      Hello,
      world!
    </p>` ) ).toBe( `[ 'p', 'Hello, world!' ]` );
  } );

  test( 'text with entities', () => {
    expect( transformCode( `<p>a &quot; b &#35; c &#x2BAD; d</p>` ) ).toBe( `[ 'p', 'a " b # c \u2BAD d' ]` );
  } );

  test( 'text with escaped characters', () => {
    expect( transformCode( `<p>a ' b \\ c</p>` ) ).toBe( `[ 'p', 'a \\' b \\\\ c' ]` );
  } );
} );

describe( 'expressions', () => {
  test( 'child expression', () => {
    expect( transformCode( `<p>{() => a() + b()}</p>` ) ).toBe( `[ 'p', () => a() + b() ]` );
  } );

  test( 'expression with sequence', () => {
    expect( transformError( `<p>{foo, bar}</p>` ) ).toHaveBeenCalledWith( 'JSX expressions may not use the comma operator' );
  } );

  test( 'spread child', () => {
    expect( transformCode( `<p>{...children}</p>` ) ).toBe( `[ 'p', ...children ]` );
  } );

  test( 'spread child with sequence', () => {
    expect( transformCode( `<p>{...(foo, bar)}</p>` ) ).toBe( `[ 'p', ...(foo, bar) ]` );
  } );

  test( 'child expression with nested tag', () => {
    expect( transformCode( `<p>{a ? <em>Test</em> : null}</p>` ) ).toBe( `[ 'p', a ? [ 'em', 'Test' ] : null ]` );
  } );
} );

describe( 'multiple children', () => {
  test( 'text and expression', () => {
    expect( transformCode( `<p>Hello, {name}!</p>` ) ).toBe( `[ 'p', 'Hello, ', name, '!' ]` );
  } );

  test( 'text and child tags', () => {
    expect( transformCode( `<p>Hello, <em>{name}</em>!</p>` ) ).toBe( `[ 'p', 'Hello, ', [ 'em', name ], '!' ]` );
  } );

  test( 'multiline tag', () => {
    expect( transformCode( `
      <div>
        <p>One</p>
        <p>Two</p>
        {...children}
      </div>
    ` ) ).toBe (`
      [ 'div',
        [ 'p', 'One' ],
        [ 'p', 'Two' ],
        ...children
      ]
    ` );
  } );

  test( 'multiline fragment', () => {
    expect( transformCode( `
      <>
        <p>One</p>
        <p>Two</p>
        {...children}
      </>
    ` ) ).toBe (`
      [[
        [ 'p', 'One' ],
        [ 'p', 'Two' ],
        ...children
      ]]
    ` );
  } );
} );

describe( 'directives', () => {
  test( 'if directive', () => {
    expect( transformCode( `<if match={a() > 0}><p>Test</p></if>` ) ).toBe( `[ 'if', a() > 0, [ 'p', 'Test' ] ]` );
  } );

  test( 'if with invalid attributes', () => {
    expect( transformError( `<if id="foo"><p>Test</p></if>` ) ).toHaveBeenCalledWith( 'Invalid attributes in if directive (1:1)' );
  } );

  test( 'switch directive', () => {
    expect( transformCode( `
      <switch>
        <if match={a() > 0}><p>Yes</p></if>
        <else><p>No</p></else>
      </switch>
    ` ) ).toBe( `
      [ 'switch',
        [ 'if', a() > 0, [ 'p', 'Yes' ] ],
        [ 'else', [ 'p', 'No' ] ]
      ]
    ` );
  } );

  test( 'switch with invalid attributes', () => {
    expect( transformError( `<switch id="foo"><if match={a() > 0}><p>Test</p></if></switch>` ) ).toHaveBeenCalledWith( 'Invalid attributes in switch directive (1:1)' );
  } );

  test( 'switch with invalid children', () => {
    expect( transformError( `<switch><p>Test</p></switch>` ) ).toHaveBeenCalledWith( 'Invalid children in switch directive (1:9)' );
  } );

  test( 'else with invalid attributes', () => {
    expect( transformError( `<else id="foo"><p>Test</p></else>` ) ).toHaveBeenCalledWith( 'Invalid attributes in else directive (1:1)' );
  } );

  test( 'unexpected else', () => {
    expect( transformError( `<div><else>foo</else></div>` ) ).toHaveBeenCalledWith( 'Unexpected else directive (1:6)' );
  } );

  test( 'for directive', () => {
    expect( transformCode( `<for items={items}>{item => <p>{item.name}</p>}</for>` ) ).toBe( `[ 'for', items, item => [ 'p', item.name ] ]` );
  } );

  test( 'for with invalid attributes', () => {
    expect( transformError( `<for id="bar">{item => <p>{item.name}</p>}</for>` ) ).toHaveBeenCalledWith( 'Invalid attributes in for directive (1:1)' );
  } );

  test( 'for with invalid chilren', () => {
    expect( transformError( `<for items={items}><p>{item.name}</p></for>` ) ).toHaveBeenCalledWith( 'Invalid children in for directive (1:1)' );
  } );

  test( 'repeat directive', () => {
    expect( transformCode( `<repeat count={count}>{index => <p>{index}</p>}</repeat>` ) ).toBe( `[ 'repeat', count, index => [ 'p', index ] ]` );
  } );

  test( 'repeat with invalid attributes', () => {
    expect( transformError( `<repeat id="bar">{index => <p>{index}</p>}</repeat>` ) ).toHaveBeenCalledWith( 'Invalid attributes in repeat directive (1:1)' );
  } );

  test( 'repeat with invalid chilren', () => {
    expect( transformError( `<repeat count={count}><p>{index}</p></repeat>` ) ).toHaveBeenCalledWith( 'Invalid children in repeat directive (1:1)' );
  } );

  test( 'dynamic directive', () => {
    expect( transformCode( `<dynamic is={type}/>` ) ).toBe( `[ 'dynamic', type ]` );
  } );

  test( 'dynamic with attributes', () => {
    expect( transformCode( `<dynamic is={type} id="foo"/>` ) ).toBe( `[ 'dynamic', type, { id: 'foo' } ]` );
  } );

  test( 'dynamic with spread attributes', () => {
    expect( transformCode( `<dynamic is={type} {...attrs}/>` ) ).toBe( `[ 'dynamic', type, attrs ]` );
  } );

  test( 'dynamic with multiple attributes', () => {
    expect( transformCode( `<dynamic is={type} id="foo" {...attrs}/>` ) ).toBe( `[ 'dynamic', type, { id: 'foo', ...attrs } ]` );
  } );

  test( 'dynamic with children', () => {
    expect( transformCode( `<dynamic is={type}>{...children}</dynamic>` ) ).toBe( `[ 'dynamic', type, ...children ]` );
  } );

  test( 'dynamic with invalid attributes', () => {
    expect( transformError( `<dynamic id="bar"/>` ) ).toHaveBeenCalledWith( 'Invalid attributes in dynamic directive (1:1)' );
  } );

  test( 'try directive', () => {
    expect( transformCode( `
      <try>
        <Component/>
        <catch>{err => <p>Test</p>}</catch>
      </try>
    ` ) ).toBe( `
      [ 'try',
        [ Component ],
        [ 'catch', err => [ 'p', 'Test' ] ]
      ]
    ` );
  } );

  test( 'try with invalid attributes', () => {
    expect( transformError( `<try id="bar"><Component/></try>` ) ).toHaveBeenCalledWith( 'Invalid attributes in try directive (1:1)' );
  } );

  test( 'catch with invalid attributes', () => {
    expect( transformError( `<catch id="foo"><p>Test</p></catch>` ) ).toHaveBeenCalledWith( 'Invalid attributes in catch directive (1:1)' );
  } );

  test( 'catch with invalid children', () => {
    expect( transformError( `<catch><p>Test</p></catch>` ) ).toHaveBeenCalledWith( 'Invalid children in catch directive (1:1)' );
  } );

  test( 'unexpected catch', () => {
    expect( transformError( `<div><catch>foo</catch></div>` ) ).toHaveBeenCalledWith( 'Unexpected catch directive (1:6)' );
  } );
} );

describe( 'full code tests', () => {
  test( 'code without JSX', () => {
    const result = plugin.transform( `console.log( 'Hello, world!' );`, 'test.jsx' );
    expect( plugin.error ).not.toHaveBeenCalled();
    expect ( result ).toBeUndefined();
  } );

  test( 'code with JSX', () => {
    expect( transformCode( `
      function App() {
        return <p>Test</p>;
      }
    ` ) ).toBe( `
      function App() {
        return [ 'p', 'Test' ];
      }
    ` );
  } );
} );
