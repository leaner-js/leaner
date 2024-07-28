---
sidebar: reference
---

# Web Module

## createApp()

Creates the root application context based on the specified component.

```js
const app = createApp( App );
```

See [Mounting a Component](../guide/components#mounting-a-component) for more information.


## app.mount()

Mounts the component associated with the root application context as the child of the specified target element.

```js
app.mount( target );
```

For example:

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

See [Mounting a Component](../guide/components#mounting-a-component) for more information.


## app.destroy()

Destroys the component associated with the root application context.

```js
app.destroy();
```

See [Mounting a Component](../guide/components#mounting-a-component) for more information.


## app.provide()

Registers a root-level dependency in the application context.

```js
app.provide( key, value );
```

The dependency is available to all components in the application. For example:

```js
import { createApp } from 'leaner/web';

const app = createApp( App );
app.provide( 'version', '1.0' );
app.mount( document.body );
```

The key can be a string or a symbol. The value can be of any type.

See [Dependency Injection](../guide/components#dependency-injection) for more information.


## app.use()

Executes a callback in the root application context.

```js
app.use( callback );
```

The callback can register lifecycle hooks and dependencies for the root application context.

See [Plugins](../guide/components#plugins) for more information.


## onMount()

Registers a callback to be executed after the component has been mounted.

```js
onMount( callback );
```

The callback can be used to attach global event handlers and perform other initialization. For example:

```js
import { onMount } from 'leaner/web';

onMount( () => {
  document.addEventListener( 'keydown', onKeyDown );
} );

function onKeyDown( e ) {
  // handle key
}
```

This method must be called in the component context or the root application context.

See [Lifecycle Hooks](../guide/components#lifecycle-hooks) for more information.


## onDestroy()

Registers a callback to be executed before the component is destroyed.

```js
onDestroy( callback );
```

The callback can be used to detach global event handlers and perform other cleanup. For example:

```js
import { onDestroy } from 'leaner/web';

onDestroy( () => {
  document.removeEventListener( 'keydown', onKeyDown );
} );
```

This method must be called in the component context or the root application context.

See [Lifecycle Hooks](../guide/components#lifecycle-hooks) for more information.


## provide()

Register a dependency in the current context.

```js
provide( key, value );
```

The dependency is available for all descendant components of the components in which it's registered. For example:

```js
import { state } from 'leaner';
import { provide } from 'leaner/web';

function App() {
  const [ user, setUser ] = state( { name: 'John', age: 35 } );

  provide( 'user', user );

  return [ /* template */ ];
}
```

The key can be a string or a symbol. The value can be of any type. This method must be called in the component context or the root application context.

See [Dependency Injection](../guide/components#dependency-injection) for more information.


## inject()

Injects a dependency provided by an ancestor component or the root application context.

```js
inject( key );
```

For example:

```js
import { inject } from 'leaner/web';

function ChildComponent() {
  const user = inject( 'user' );

  return [ 'div', user.name ];
}
```

The key can be a string or a symbol. This method must be called in the component context or the root application context.

See [Dependency Injection](../guide/components#dependency-injection) for more information.
