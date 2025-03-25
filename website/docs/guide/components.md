---
sidebar: guide
---

# Components

A Leaner component is basically a function which returns a [template](./templates). The simplest component was already shown in the [Quick Start](./quick-start) chapter:

```js
function App() {
  return [ 'div', { class: 'hello' },
    [ 'h1', 'Hello, world!' ],
    [ 'p', 'This is my first Leaner application.' ],
  ];
}
```

A component function can have two optional parameters: `props` and `children`:

 - `props` is an object containing properties passed to the component
 - `children` is an array containing children of the component

If the component has no properties, an empty object is passed. Similarly, if the component doesn't have any children, an empty array is passed.

The component can simply pass its properties and children directly to the template:

```js
export function Button( props, children ) {
  return [ 'button', { type: 'button', ...props }, ...children ];
}
```

This component can be used in the template of a parent component like this:

```js
import Button from './Button.js';

function App() {
  return [ Button, { class: 'btn-primary', onclick: submitForm }, 'OK' ]
}
```

Of course you can place all components in a single file, but usually it's more convenient to put each component in a separate file and import it to the parent component which uses it, as shown above.

The component can also destructure the properties in order to pass them to different elements or to manipulate them in some way, as shown in the [Reactive Properties](#reactive-properties) section below.

You can create a component which consists of multiple root elements (or child components) by returning a [fragment](./templates#fragments):

```js
function App() {
  return [[
    [ 'h1', 'Hello, world!' ],
    [ 'p', 'This is my first Leaner application.' ],
  ]];
}
```


## Reactive Properties

Let's assume that you want to create an `Icon` component which renders an icon with the following markup:

```html
<i class="i i-user"></i>
```

The component can look like this:

```js
function Icon( { name } ) {
  return [ 'i', { class: [ 'i', 'i-' + name ] } ];
}
```

You can use it like this:

```js
[ Icon, { name: 'user' } ]
```

This will produce the markup presented above. However, if `name` is a reactive state, the component won't work, because it's not possible to concatenate a constant string with a function.

You could create another version which expects `name` to be a function:

```js
function Icon( { name } ) {
  return [ 'i', { class: [ 'i', () => 'i-' + name() ] } ];
}
```

Now you can use it like this:

```js
const [ name, setName ] = state( 'user' );

return [ Icon, { name } ];
```

However, in that case it's not possible to pass a constant string to the component.

You can check the type of the `name` parameter in your component. However, in many cases, a simpler solution is to use the helper `transform()` function:

```js
import { transform } from 'leaner';

function Icon( { name } ) {
  return [ 'i', {
    class: [ 'i', transform( name, value => 'i-' + value ) ],
  } ];
}
```

When `name` is a function, `transform()` will create a [computed](./advanced-reactivity#computed-state) function, which is also reactive. Otherwise, it will just call the second function and return its result as a simple value.

To handle more complex scenarios, two other helpers functions are available: `get()` will return the current value of a parameter, regardless of whether its a reactive function or a plain value, and `getter()` will always return a function, whether a function or a plain value is passed.

In the following example, `get()` is used to check if the value of the `options` parameter is not null, and `getter()` is used to pass it to the [for](./conditions-and-lists.md#list-rendering) directive, which always expects a reactive function as a parameter.

```js
import { get, getter } from 'leaner';

function Select( { options } ) {
  return [ 'select',
    [ 'if', () => get( options ) != null,
      [ 'for', getter( options ), option => [ 'option', option ] ],
    ],
  ];
}
```

You can also combine both approaches and destructure some properties, while passing the remaining properties directly to the HTML element. For example:

```js
function IconButton( { name, ...props }, children ) {
  return [ 'button', { type: 'button', ...props },
    [ Icon, { name } ], ...children,
  ];
}
```


## Lifecycle Hooks

In Leaner, the component function is only executed once when an instance of the component is created, not on every render like in some other frameworks, for example React. It means that you can perform most initialization directly in the component function.

However, there are situations when you must defer the execution of some code after the component has been created and mounted, for example when you need to access and manipulate DOM elements manually. You can use the `onMount()` function to do that.

```js
import { state } from 'leaner';
import { onMount } from 'leaner/web';

function FocusableButton( props, children ) {
  const [ button, setButton ] = state( null );

  onMount( () => {
    button().focus();
  } );

  return [ 'button', { ref: setButton, type: 'button', ...props }, ...children ];
}
```

In the example above, the special [`ref`](./templates.md#references) property is used to save the reference to the button DOM element as a reactive state. The function which is passed as an argument to `onMount()` can access this DOM element and manipulate it, in this case by setting focus to it.

The corresponding `onDestroy()` function can be used to execute some code just before the component is removed from the DOM and destroyed. You can use both functions for example to register and unregister event handlers for the document or window object.

```js
import { onDestroy, onMount } from 'leaner/web';

function GlobalKeyObserver( props, children ) {
  onMount( () => {
    document.addEventListener( 'keydown', onKeyDown );
  } );

  onDestroy( () => {
    document.removeEventListener( 'keydown', onKeyDown );
  } );

  function onKeyDown( e ) {
    // handle key
  }

  return [ 'div', props, ...children ];
}
```

::: tip NOTE
Unlike most functions presented so far, `onMount()` and `onDestroy()` should be imported from the `leaner/web` module instead of the `leaner` module.
:::


## Mounting a Component

The process of mounting a component consists of four stages:

 - a component context is created
 - the component function is called within that context
 - the HTML elements are created based on the returned template
 - the HTML elements are attached to the DOM

When a parent component is created, it automatically mounts it child components which are part of its template. However the root component must be mounted manually.

Let's go back to the first code example presented in this guide:

```js
import { createApp } from 'leaner/web';

function App() {
  return [ 'div', { class: 'hello' },
    [ 'h1', 'Hello, world!' ],
    [ 'p', 'This is my first Leaner application.' ],
  ];
}

createApp( App ).mount( document.body );
```

The `App()` function represents a component. By calling `createApp()`, you create a root application context for your component. At this moment, the component instance is not created yet. You can use the application context to inject dependencies or register global lifecycle hooks. However in this simple example, the `mount()` method is called directly on the returned object.

The `mount()` method creates an instance of the component and attaches it to the DOM as a child of the specified element. In this case, the document's body element is used, but it can be any element which is already part of the DOM, for example:

```js
createApp( App ).mount( document.querySelector( '#app' ) );
```

::: tip NOTE
When a component is mounted, existing children of the parent element are not removed. The elements created by the component are appended to existing children.
:::

You can create as many top-level component instances as you want, using the same component or different components.

To destroy the component, save the root application context and use the `destroy()` method:

```js
import { createApp } from 'leaner/web';

const app = createApp( App );
app.mount( document.body );

// later:

app.destroy();
```

When a component is destroyed, all its child components are destroyed, and its elements are removed from the DOM.


## Dependency Injection

You can use properties to pass data from parent components to child components. However, for complex applications consisting of deeply nested components, this can become hard to maintain. Another solution is to use the dependency injection to pass data from a parent component to all its descendants.

For example, let's assume that the parent component looks like this:

```js
import { state } from 'leaner';
import { provide } from 'leaner/web';

function App() {
  const [ user, setUser ] = state( { name: 'John', age: 35 } );

  provide( 'user', user );

  return [ /* template */ ];
}
```

The `user` function is provided by the component to all its descendants using the `'user'` key. The key can be any string or symbol. A child component can access this function by injecting it:

```js
import { inject } from 'leaner/web';

function ChildComponent() {
  const user = inject( 'user' );

  return [ 'div', user.name ];
}
```

The injected data doesn't have to be reactive. It can be any type of value, for example a simple string or number, or a complex object.

Any component can serve as a dependency provider, not just the top level component. When a dependency is injected, all parent components are searched for the provided value with the given key, up to the root component.

The root application context also has a `provide()` method which makes it possible to pass a dependency to all components within that application:

```js
import { createApp } from 'leaner/web';

const app = createApp( App );
app.provide( 'version', '1.0' );
app.mount( document.body );
```


## Plugins

Lifecycle hooks and dependencies can also be registered for the root application context by calling the `use()` method. Inside the callback you can use all functions which are allowed at the level of a component, including `onMount()`, `onDestroy()`, `provide()`, etc. This is useful for registering plugins for the application.

For example, a plugin which handles keyboard shortcuts for the entire application could look like this:

```js
import { createApp, onDestroy, onMount } from 'leaner/web';

const app = createApp( App );

app.use( () => {
  onMount( () => {
    document.addEventListener( 'keydown', onKeyDown );
  } );

  onDestroy( () => {
    document.removeEventListener( 'keydown', onKeyDown );
  } );

  function onKeyDown( e ) {
    // handle key
  }
} );

app.mount( document.body );
```
