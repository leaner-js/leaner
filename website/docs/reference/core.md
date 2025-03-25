---
sidebar: reference
---

# Core Module

## state()

Returns a reactive state getter and setter.

```js
const [ getter, setter ] = state( initial );
```

The getter is a function which returns the current state. The setter makes it possible to update the state. For example:

```js
import { state } from 'leaner';

const [ name, setName ] = state( 'John' );
```

See [Reactive State](../guide/reactive-state) for more information.


## computed()

Returns a computed state getter with automatically resolved dependencies.

```js
const getter = computed( callback );
```

The return value is a function which returns the computed state. For example:

```js
import { computed, state } from 'leaner';

const [ todos, setTodos ] = state( [ { name: 'Learn Leaner', completed: false } ] );

const activeTodos = computed( () => todos().filter( t => !t.completed ) );
```

See [Computed State](../guide/advanced-reactivity#computed-state) for more information.


## transform()

Returns a computed state getter or constant value.

```js
const value = transform( value, callback );
```

When the first argument is a function, `transform()` will create a computed state by passing it to the callback; otherwise, it will just call the callback and directly return its result. For example:

```js
import { transform } from 'leaner';

function Icon( { name } ) {
  return [ 'i', {
    class: [ 'i', transform( name, value => 'i-' + value ) ],
  } ];
}
```

See [Reactive Properties](../guide/components#reactive-properties) for more information.


## get()

```js
const value = get( valueOrFunction );
```

When the argument is a function, `get()` will call it and return its result; otherwise, it will just return the argument.

See [Reactive Properties](../guide/components#reactive-properties) for more information.


## getter()

```js
const callback = getter( valueOrFunction );
```

When the argument is a function, `getter()` will return it; otherwise, it will return a function which returns the argument.

See [Reactive Properties](../guide/components#reactive-properties) for more information.


## mutate()

Wraps a function which mutates existing state.

```js
const mutator = mutator( callback );
```

The mutator can be passed to a state setter to update the state. For example:

```js
import { mutate, state } from 'leaner';

const [ fruits, setFruits ] = state( [ 'apple', 'orange', 'peach' ] );

setFruits( mutate( value => { value.push( 'cherry' ); } ) );
```

See [Mutations](../guide/advanced-reactivity#mutations) for more information.


## watch()

Creates a synchronous watcher with explicit dependency.

```js
watch( getter, callback );
```

The callback is executed immediately when the dependency is updated. For example:

```js
import { state, watch } from 'leaner';

const [ min, setMin ] = state( 5 );
const [ max, setMax ] = state( 10 );

watch( min, value => {
  if ( value > max() )
    setMax( value );
} );
```

See [Synchronous Watcher](../guide/advanced-reactivity#synchronous-watcher) for more information.


## effect()

Creates an asynchronous effect with automatically resolved dependencies.

```js
effect( callback );
```

The callback is executed after the effect has been created, and after any of its dependencies has been updated. For example:

```js
import { effect, state } from 'leaner';

const [ id, setId ] = state( 12 );
const [ data, setData ] = state( null );

effect( async () => {
  const response = await fetch( `http://example.com/data/${id()}` );
  setData( await response.json() );
} );
```

See [Asynchronous Effect](../guide/advanced-reactivity#asynchronous-effect) for more information.


## reactive()

Creates an asynchronous watcher with explicit dependency and immediately executed callback.

```js
reactive( getter, callback );
```

The callback is executed immediately when the watcher is created, and asynchronously after the dependency has been updated. For example:

```js
import { state, reactive } from 'leaner';

const [ title, setTile ] = state( 'Hello, world' );

reactive( title, value => {
  document.title = value;
} );
```

See [Reactive Dependency](../guide/advanced-reactivity#reactive-dependency) for more information.


## schedule()

Adds the callback to the scheduler queue.

```js
schedule( callback );
```

See [Scheduler](../guide/advanced-reactivity#scheduler) for more information.
