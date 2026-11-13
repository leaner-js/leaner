import { beforeEach, describe, expect, test, vi } from 'vitest';
import leanerJsx from 'leaner-jsx';

let plugin;
let ctx;

beforeEach( () => {
  plugin = leanerJsx();
  ctx = {
    error: vi.fn().mockName( 'ctx.error' ),
    warn: vi.fn().mockName( 'ctx.warn' ),
  };
} );

async function callPlugin( code ) {
  return await plugin.transform.handler.call( ctx, code, 'test.jsx' );
}

async function transformCode( code ) {
  const result = await callPlugin( code );
  expect( ctx.error ).not.toHaveBeenCalled();
  expect ( result ).toHaveProperty( 'code' );
  return result.code;
}

async function transformError( code ) {
  const result = await callPlugin( code );
  expect( ctx.error ).toHaveBeenCalled();
  expect( result ).toBeUndefined();
  return ctx.error;
}

describe( 'elements', () => {
  test( 'normal tag', async () => {
    expect( await transformCode( `<p>Test</p>` ) ).toBe( `[ 'p', 'Test' ]` );
  } );

  test( 'self-closing tag', async () => {
    expect( await transformCode( `<hr/>` ) ).toBe( `[ 'hr' ]` );
  } );

  test( 'tag with dash', async () => {
    expect( await transformCode( `<my-button>Test</my-button>` ) ).toBe( `[ 'my-button', 'Test' ]` );
  } );

  test( 'tag with namespace', async () => {
    expect( await transformError( `<ns:button>Test</ns:button>` ) ).toHaveBeenCalledWith( 'JSX namespaces are not supported (1:2)' );
  } );

  test( 'unbalanced tag', async () => {
    expect( await transformError( `<div>Test</p>` ) ).toHaveBeenCalledWith( 'Expected corresponding JSX closing tag for \'div\'.' );
  } );

  test( 'component', async () => {
    expect( await transformCode( `<MyButton>Test</MyButton>` ) ).toBe( `[ MyButton, 'Test' ]` );
  } );

  test( 'self-closing component', async () => {
    expect( await transformCode( `<MyButton/>` ) ).toBe( `[ MyButton ]` );
  } );

  test( 'component with dot', async () => {
    expect( await transformCode( `<MyButton.Content>Test</MyButton.Content>` ) ).toBe( `[ MyButton.Content, 'Test' ]` );
  } );

  test( 'fragment', async () => {
    expect( await transformCode( `<><p>One</p><p>Two</p></>` ) ).toBe( `[[ [ 'p', 'One' ], [ 'p', 'Two' ] ]]` );
  } );
} );

describe( 'attributes', () => {
  test( 'text attribute', async () => {
    expect( await transformCode( `<p id="para">Test</p>` ) ).toBe( `[ 'p', { id: 'para' }, 'Test' ]` );
  } );

  test( 'text attribute with entities', async () => {
    expect( await transformCode( `<p id="a &quot; b &#35; c &#x2BAD; d">Test</p>` ) ).toBe( `[ 'p', { id: 'a " b # c \u2BAD d' }, 'Test' ]` );
  } );

  test( 'text attribute with unknown entity', async () => {
    expect( await transformCode( `<p id="a &unknown; b">Test</p>` ) ).toBe( `[ 'p', { id: 'a &unknown; b' }, 'Test' ]` );
  } );

  test( 'text attribute with escaped characters', async () => {
    expect( await transformCode( `<p id="a ' b \n c \u2028 d">Test</p>` ) ).toBe( `[ 'p', { id: 'a \\' b \\n c \\u2028 d' }, 'Test' ]` );
  } );

  test( 'attribute with dash', async () => {
    expect( await transformCode( `<p aria-hidden="true">Test</p>` ) ).toBe( `[ 'p', { 'aria-hidden': 'true' }, 'Test' ]` );
  } );

  test( 'attribute with namespace', async () => {
    expect( await transformError( `<p ns:hidden="true">Test</p>` ) ).toHaveBeenCalledWith( 'JSX namespaces are not supported (1:4)' );
  } );

  test( 'boolean attribute', async () => {
    expect( await transformCode( `<p hidden>Test</p>` ) ).toBe( `[ 'p', { hidden: true }, 'Test' ]` );
  } );

  test( 'expression attribute', async () => {
    expect( await transformCode( `<p class={classes}>Test</p>` ) ).toBe( `[ 'p', { class: classes }, 'Test' ]` );
  } );

  test( 'expression attribute with the same name', async () => {
    expect( await transformCode( `<p style={style}>Test</p>` ) ).toBe( `[ 'p', { style }, 'Test' ]` );
  } );

  test( 'expression attribute with sequence', async () => {
    expect( await transformError( `<p style={foo, bar}>Test</p>` ) ).toHaveBeenCalledWith( 'JSX expressions may not use the comma operator' );
  } );

  test( 'multiple attributes', async () => {
    expect( await transformCode( `<p id="para" hidden class={classes} style={style}>Test</p>` ) ).toBe( `[ 'p', { id: 'para', hidden: true, class: classes, style }, 'Test' ]` );
  } );

  test( 'self-closing element with multiple attributes', async () => {
    expect( await transformCode( `<img src="image.png" hidden class={classes} style={style}/>` ) ).toBe( `[ 'img', { src: 'image.png', hidden: true, class: classes, style } ]` );
  } );

  test( 'spread attribute', async () => {
    expect( await transformCode( `<p {...attrs}>Test</p>` ) ).toBe( `[ 'p', attrs, 'Test' ]` );
  } );

  test( 'spread attribute with sequence', async () => {
    expect( await transformCode( `<p {...( foo, bar )}>Test</p>` ) ).toBe( `[ 'p', ( foo, bar ), 'Test' ]` );
  } );

  test( 'multiple attributes with spread', async () => {
    expect( await transformCode( `<p id="para" {...attrs} hidden>Test</p>` ) ).toBe( `[ 'p', { id: 'para', ...attrs, hidden: true }, 'Test' ]` );
  } );

  test( 'multiple attributes with spread sequence', async () => {
    expect( await transformCode( `<p id="para" {...( foo, bar )} hidden>Test</p>` ) ).toBe( `[ 'p', { id: 'para', ...( foo, bar ), hidden: true }, 'Test' ]` );
  } );
} );

describe( 'text', () => {
  test( 'simple text', async () => {
    expect( await transformCode( `<p>Test</p>` ) ).toBe( `[ 'p', 'Test' ]` );
  } );

  test( 'text with whitespace', async () => {
    expect( await transformCode( `<p> Test </p>` ) ).toBe( `[ 'p', ' Test ' ]` );
  } );

  test( 'text in separate line', async () => {
    expect( await transformCode( `<p>
      Test
    </p>` ) ).toBe( `[ 'p', 'Test' ]` );
  } );

  test( 'mulitple lines', async () => {
    expect( await transformCode( `<p>
      Hello,
      world!
    </p>` ) ).toBe( `[ 'p', 'Hello, world!' ]` );
  } );

  test( 'text with entities', async () => {
    expect( await transformCode( `<p>a &quot; b &#35; c &#x2BAD; d</p>` ) ).toBe( `[ 'p', 'a " b # c \u2BAD d' ]` );
  } );

  test( 'text with escaped characters', async () => {
    expect( await transformCode( `<p>a ' b \\ c</p>` ) ).toBe( `[ 'p', 'a \\' b \\\\ c' ]` );
  } );
} );

describe( 'expressions', () => {
  test( 'child expression', async () => {
    expect( await transformCode( `<p>{() => a() + b()}</p>` ) ).toBe( `[ 'p', () => a() + b() ]` );
  } );

  test( 'expression with sequence', async () => {
    expect( await transformError( `<p>{foo, bar}</p>` ) ).toHaveBeenCalledWith( 'JSX expressions may not use the comma operator' );
  } );

  test( 'spread child', async () => {
    expect( await transformCode( `<p>{...children}</p>` ) ).toBe( `[ 'p', ...children ]` );
  } );

  test( 'spread child with sequence', async () => {
    expect( await transformCode( `<p>{...(foo, bar)}</p>` ) ).toBe( `[ 'p', ...(foo, bar) ]` );
  } );

  test( 'child expression with nested tag', async () => {
    expect( await transformCode( `<p>{a ? <em>Test</em> : null}</p>` ) ).toBe( `[ 'p', a ? [ 'em', 'Test' ] : null ]` );
  } );
} );

describe( 'multiple children', () => {
  test( 'text and expression', async () => {
    expect( await transformCode( `<p>Hello, {name}!</p>` ) ).toBe( `[ 'p', 'Hello, ', name, '!' ]` );
  } );

  test( 'text and child tags', async () => {
    expect( await transformCode( `<p>Hello, <em>{name}</em>!</p>` ) ).toBe( `[ 'p', 'Hello, ', [ 'em', name ], '!' ]` );
  } );

  test( 'multiline tag', async () => {
    expect( await transformCode( `
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

  test( 'multiline fragment', async () => {
    expect( await transformCode( `
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
  test( 'if directive', async () => {
    expect( await transformCode( `<if match={a() > 0}><p>Test</p></if>` ) ).toBe( `[ 'if', a() > 0, [ 'p', 'Test' ] ]` );
  } );

  test( 'if with invalid attributes', async () => {
    expect( await transformError( `<if id="foo"><p>Test</p></if>` ) ).toHaveBeenCalledWith( 'Invalid attributes in if directive (1:1)' );
  } );

  test( 'switch directive', async () => {
    expect( await transformCode( `
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

  test( 'switch with invalid attributes', async () => {
    expect( await transformError( `<switch id="foo"><if match={a() > 0}><p>Test</p></if></switch>` ) ).toHaveBeenCalledWith( 'Invalid attributes in switch directive (1:1)' );
  } );

  test( 'switch with invalid children', async () => {
    expect( await transformError( `<switch><p>Test</p></switch>` ) ).toHaveBeenCalledWith( 'Invalid children in switch directive (1:9)' );
  } );

  test( 'else with invalid attributes', async () => {
    expect( await transformError( `<else id="foo"><p>Test</p></else>` ) ).toHaveBeenCalledWith( 'Invalid attributes in else directive (1:1)' );
  } );

  test( 'unexpected else', async () => {
    expect( await transformError( `<div><else>foo</else></div>` ) ).toHaveBeenCalledWith( 'Unexpected else directive (1:6)' );
  } );

  test( 'for directive', async () => {
    expect( await transformCode( `<for items={items}>{item => <p>{item.name}</p>}</for>` ) ).toBe( `[ 'for', items, item => [ 'p', item.name ] ]` );
  } );

  test( 'for with invalid attributes', async () => {
    expect( await transformError( `<for id="bar">{item => <p>{item.name}</p>}</for>` ) ).toHaveBeenCalledWith( 'Invalid attributes in for directive (1:1)' );
  } );

  test( 'for with invalid chilren', async () => {
    expect( await transformError( `<for items={items}><p>{item.name}</p></for>` ) ).toHaveBeenCalledWith( 'Invalid children in for directive (1:1)' );
  } );

  test( 'repeat directive', async () => {
    expect( await transformCode( `<repeat count={count}>{index => <p>{index}</p>}</repeat>` ) ).toBe( `[ 'repeat', count, index => [ 'p', index ] ]` );
  } );

  test( 'repeat with invalid attributes', async () => {
    expect( await transformError( `<repeat id="bar">{index => <p>{index}</p>}</repeat>` ) ).toHaveBeenCalledWith( 'Invalid attributes in repeat directive (1:1)' );
  } );

  test( 'repeat with invalid chilren', async () => {
    expect( await transformError( `<repeat count={count}><p>{index}</p></repeat>` ) ).toHaveBeenCalledWith( 'Invalid children in repeat directive (1:1)' );
  } );

  test( 'dynamic directive', async () => {
    expect( await transformCode( `<dynamic is={type}/>` ) ).toBe( `[ 'dynamic', type ]` );
  } );

  test( 'dynamic with attributes', async () => {
    expect( await transformCode( `<dynamic is={type} id="foo"/>` ) ).toBe( `[ 'dynamic', type, { id: 'foo' } ]` );
  } );

  test( 'dynamic with spread attributes', async () => {
    expect( await transformCode( `<dynamic is={type} {...attrs}/>` ) ).toBe( `[ 'dynamic', type, attrs ]` );
  } );

  test( 'dynamic with multiple attributes', async () => {
    expect( await transformCode( `<dynamic is={type} id="foo" {...attrs}/>` ) ).toBe( `[ 'dynamic', type, { id: 'foo', ...attrs } ]` );
  } );

  test( 'dynamic with children', async () => {
    expect( await transformCode( `<dynamic is={type}>{...children}</dynamic>` ) ).toBe( `[ 'dynamic', type, ...children ]` );
  } );

  test( 'dynamic with invalid attributes', async () => {
    expect( await transformError( `<dynamic id="bar"/>` ) ).toHaveBeenCalledWith( 'Invalid attributes in dynamic directive (1:1)' );
  } );

  test( 'try directive', async () => {
    expect( await transformCode( `
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

  test( 'try with invalid attributes', async () => {
    expect( await transformError( `<try id="bar"><Component/></try>` ) ).toHaveBeenCalledWith( 'Invalid attributes in try directive (1:1)' );
  } );

  test( 'catch with invalid attributes', async () => {
    expect( await transformError( `<catch id="foo"><p>Test</p></catch>` ) ).toHaveBeenCalledWith( 'Invalid attributes in catch directive (1:1)' );
  } );

  test( 'catch with invalid children', async () => {
    expect( await transformError( `<catch><p>Test</p></catch>` ) ).toHaveBeenCalledWith( 'Invalid children in catch directive (1:1)' );
  } );

  test( 'unexpected catch', async () => {
    expect( await transformError( `<div><catch>foo</catch></div>` ) ).toHaveBeenCalledWith( 'Unexpected catch directive (1:6)' );
  } );
} );

describe( 'full code tests', () => {
  test( 'code without JSX', async () => {
    const result = await callPlugin( `console.log( 'Hello, world!' );` );
    expect( ctx.error ).not.toHaveBeenCalled();
    expect ( result ).toBeUndefined();
  } );

  test( 'code with JSX', async () => {
    expect( await transformCode( `
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
