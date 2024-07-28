---
sidebar: guide
---

# Advanced Reactivity

## Mutations

The [Reactive State](./reactive-state) chapter introduced the concept of state, which can be accessed using the getter function and updated using the setter function.

When the state stores complex object or arrays, it is often necessary to perform only a partial update, by combining the existing state with new values. One way to do it is to pass a function to the setter which receives the current state a parameter, and returns the new state.

For example, to append an element to an array, a function which creates a new array can be created like this:

```js
import { state } from 'leaner';

const [ fruits, setFruits ] = state( [ 'apple', 'orange', 'peach' ] );

setFruits( value => [ ...value, 'cherry' ] );
```

Another way to perform the same operation is to use the `mutate()` function:

```js
import { mutate, state } from 'leaner';

const [ fruits, setFruits ] = state( [ 'apple', 'orange', 'peach' ] );

setFruits( mutate( value => { value.push( 'cherry' ); } ) );
```

The function passed to `mutate()` also receives the current value of the state, but it can be modified directly by setting properties or calling array methods such as `push()`, `pop()`, `shift()`, etc. Deeply nested objects and arrays can be mutated as well. You can also combine multiple operations in a single mutation:

```js
import { mutate, state } from 'leaner';

const [ user, setUser ] = state( {
  name: 'John',
  age: 35,
  roles: [ 'manager' ],
} );

setUser( mutate( value => {
  value.age = 36;
  value.roles.push( 'admin' );
} ) );
```

The advantage of using mutations is not only easier to understand code, but also fine-grained control over which part of the state is updated. For example, if a component only depends on the user's name, it doesn't need to be updated when only the age and roles are changed.


## Computed State

Computed state can be created by performing some computation on other state. For example, the user's full name can be created by combining the first name and last name:

```js
import { state } from 'leaner';

const [ user, setUser ] = state( { firstName: 'John', lastName: 'Smith' } );

function fullName() {
  return `${user().firstName} ${user().lastName}`;
}
```

The `fullName()` function can be used whenever reactive state is expected, for example in a component's template:

```js
[ 'div', { class: 'user-name' }, fullName ]
```

However, when such function is used in multiple places, it has to be called multiple times whenever one of its dependencies is updated.

A better solution is to create computed state using the `computed()` function.

```js
import { computed, state } from 'leaner';

const [ todos, setTodos ] = state( [ { name: 'Learn Leaner', completed: false } ] );

const activeTodos = computed( () => todos().filter( t => !t.completed ) );
```

In this example, `activeTodos()` is a function which returns the items of the `todos()` array which are not completed. You can call this function multiple times and it will always return the same value, without actually computing it.

However, if the `todos()` array is updated and then you call `activeTodos()`, it will perform the computation again and remember the new value.

Note that the computed state automatically tracks it's dependencies. There is no need to explicitly specify which state it depends on.

When computed state is created in the context of a component, it's automatically deactivated when the component is destroyed.


## Watchers

When reactive state is passed to a component's template, the corresponding DOM elements are automatically updated in Leaner. However, in some cases it's necessary to perform a custom operation whenever reactive state is updated.

### Synchronous Watcher

The first scenario is when you need to synchronously change one state based on another:

```js
import { state, watch } from 'leaner';

const [ min, setMin ] = state( 5 );
const [ max, setMax ] = state( 10 );

watch( min, value => {
  if ( value > max() )
    setMax( value );
} );
```

This example watches the `min()` state. Whenever it's updated, the function is called to make sure that the `max()` state is never lower than the `min()` state.

The watched state is explicitly passed as the fist argument to `watch()`. Because of this, the callback is executed only when the `min()` state is updated, but not if the `max()` state is updated.

The callback passed to `watch()` is executed synchronously, as soon as the `min()` state is updated, however it's not executed immediately when the watcher is created.

The callback is not executed when the state is updated, but the new value is equal to the old value.

The new value of the watched state is passed as the first parameter to the callback. The old value is passed as the second parameter.

### Asynchronous Effect

The second scenario is when you need to load some external data asynchronously based on some state:

```js
import { effect, state } from 'leaner';

const [ id, setId ] = state( 12 );
const [ data, setData ] = state( null );

effect( async () => {
  const response = await fetch( `http://example.com/data/${id()}` );
  setData( await response.json() );
} );
```

The first execution of the callback is delayed until after the effect has been created. When the effect is created in the context of a component, it's already mounted by the time the callback is called. The subsequent executions are also performed asynchronously, after one or more dependencies have been updated.

Unlike `watch()`, the dependencies are not explicitly passed to `effect()`, but are automatically tracked when the callback is executed. However, if the callback passed to `effect()` is asynchronous, the automatic dependency tracking only occurs until the execution stops at the first `await` statement.

### Reactive Dependency

The third scenario is when you need to perform some operation immediately, and then perform it again when some state is updated:

```js
import { state, reactive } from 'leaner';

const [ title, setTile ] = state( 'Hello, world' );

reactive( title, value => {
  document.title = value;
} );
```

The `reactive()` function is similar to `watch()`, but there are two important differences: `reactive()` executes the callback immediately, and the subsequent executions are performed asynchronously, after one or more dependencies have been updated.

Similar to `watch()`, the watched state is explicitly passed as the fist argument to `reactive()`. The callback is not executed when the state is updated, but the new value is equal to the old value. The new value of the watched state is passed as the first parameter to the callback, and the old value is passed as the second parameter.

The `reactive()` function is used internally by Leaner to update the content and attributes of DOM elements when reactive state is updated. You can use it manually for example to update elements which are outside of the component.

### Summary

The following table highlights the most important differences between the three types of watchers:

|                               | `watch()`                                       | `effect()`                          | `reactive()`                                     |
| ----------------------------- | ----------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| **Dependencies**              | Explicitly specified                            | Automatically determined            | Explicitly specified                             |
| **New and old value**         | Passed to the callback                          | Not available                       | Passed to the callback                           |
| **Initial execution**         | Not executed                                    | Delayed after watcher is created    | Executed immediately when the watcher is created |
| **Next executions condition** | Only if new value is not equal to old value     | When any dependency is updated      | Only if new value is not equal to old value      |
| **Next executions timing**    | Executed immediately when dependency is updated | Delayed after dependency is updated | Delayed after dependency is updated              |

When a watcher is created in the context of a component, it's automatically deactivated when the component is destroyed, which means that the callback is no longer executed when the watched state is updated.


## Scheduler

In order to optimize performance, Leaner doesn't execute DOM updates immediately when state is updated, but schedules them to be performed asynchronously. In certain scenarios it can lead to unexpected problems. Consider this example:

```js
import { state } from 'leaner';

function Component() {
  const [ visible, setVisible ] = state( false );
  const [ ref, setRef ] = state( null );

  function showInput() {
    setVisible( true );
    ref().focus(); // this is incorrect
  }

  return [
    [ 'button', { type: 'button', onclick: showInput }, 'Show' ],
    [ 'if', visible,
      [ 'input', { ref, type: 'text' } ],
    ],
  ];
}
```

Because of the `if` directive, the `<input>` element isn't created until the `visible()` state is set to true. However, this doesn't happen immediately when `setVisible()` is called, so the `ref()` state is still null and the code fails.

To fix this, the code can be changed in the following way:

```js
function showInput() {
  setVisible( true );
  schedule( () => {
    ref().focus();
  } );
}
```

The callback passed to `schedule()` isn't executed immediately. Instead, it's added to the same queue which is used by watchers, such as `effect()` and `reactive()`. Because the `if` directive uses the `reactive()` watcher internally to update its state, the input element will be already created by the time the callback is executed, and the code will work correctly.

Note that a similar result can be achieved by using the `reactive()` watcher, for example:

```js
reactive( ref, value => {
  if ( value != null )
    value.focus();
} );
```

The scheduler queue in Leaner is based on the JavaScript [microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).
