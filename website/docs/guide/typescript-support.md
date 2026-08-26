---
sidebar: guide
---

# TypeScript Support

Leaner provides full TypeScript support. This is useful not only when writing applications in TypeScript, but also for intellisense and autocompletion when writing plain JavaScript code.

Applications written in TypeScript should use [JSX templates](./jsx-templates) to fully take advantage of type checking, both when using HTML elements and custom components. To ensure that JSX templates are correctly interpreted by the TypeScript compiler, you should add the following options to your `tsconfig.json` file:

```js
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "leaner"
  }
}
```


## Reactive State

Reactive state created using the `state()` function is strongly typed:

```js
import { state } from 'leaner';

const [ name, setName ] = state( 'John' );

setName( 'Mary' ); // valid
setName( 44 );     // invalid, value must be a string
```

You can also explicitly declare the type, which is useful when the state is initialized using `null` or an empty array:

```js
const [ element, setElement ] = state<HTMLElement | null>( null );

setElement( document.body ); // valid
```


## Component Properties

You can declare property types for you components in the following way:

```js
interface MyComponentProps {
  name: string;
}

export function MyComponent( { name }: MyComponentProps, children: any[] ) {
  return (
    // ...
  );
}
```

Property types are then checked when the component is used in a JSX template:

```js
<MyComponent name="Mary"/> // valid
<MyComponent name={44}/>   // invalid, property must be a string
```


## Event Handlers

Type checking works out of the box for inline event handlers:

```js
const [ text, setText ] = state( '' );

return (
  <input type="text" value={text} onchange={e => setText( e.target.value )}/>
);
```

If you declare the event handlers outside of the JSX template, use the event types from the Leaner namespace. They are equivalent to the built-in event types, but the `currentTarget` property is typed to the specific HTML element.

```js
import type { Leaner } from 'leaner/web';

function onclick( e: Leaner.MouseEvent<HTMLButtonElement> ) {
  // e.currentTarget is an HTMLButtonElement
}
```

The `TargetEvent` type is equivalent to `Event`,  but it also has the `target` property typed to the specific HTML element, which is useful when listening to events on an element which doesn't contain any children, such as the `onchange` event on the `<input>` element:

```js
import type { Leaner } from 'leaner/web';

function onchange( e: Leaner.TargetEvent<HTMLInputElement> ) {
  // both e.currentTarget and e.target are an HTMLInputElement
}
```

The `FocusTargetEvent` type is equivalent to `FocusEvent`, but it also has the `target` property typed to the specific HTML element, which is useful for handling the non-bubbling `onblur` and `onfocus` events.


## HTML Attributes

Some custom components need to be able to pass arbitrary HTML attributes and event handlers to their HTML element using the spread syntax. In this case, the interface for the component can extend one of the built-in interfaces for HTML elements:

```js
import type { Leaner } from 'leaner/web';

interface ButtonProps extends Leaner.HTMLButtonProps {
  kind: string;
}

function Button( { kind, ...props }: ButtonProps, children: any[] ) {
  return (
    <button class={[ 'btn', 'btn-' + kind ]} {...props}>{...children}</button>
  );
}
```

This makes it possible to check the types of HTML attributes and event handlers:

```js
<Button kind="primary" id="okButton"/> // valid
<Button kind="primary" id={44}/>       // invalid, attribute must be a string
```


The base `HTMLProps` interface can be used for HTML elements which don't have any custom attributes.


## Dependency Injection

By default, the `inject()` function returns the `unknown` type, because it's not possible to know the type of the value that was injected using `provide()` at compile time.

You can also explicitly declare the type:

```js
const value = inject<string>( 'key' ); // value is string | undefined
```

However, there is no guarantee that the actual injected value matches the specified type. Another solution is to use strongly typed injection keys:

```js
import { provide, inject } from 'leaner/web';
import type { InjectionKey } from 'leaner/web';

const key = Symbol() as InjectionKey<string>;

provide( key, 'value' );

const value = inject( key ); // value is string | undefined
```

The injection key can be placed in a separate file so that it can be imported in multiple components.
