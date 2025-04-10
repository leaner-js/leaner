---
sidebar: guide
---

# Error Handling

You can use the `'try'` directive to handle errors in Leaner. It must contain a single child element and a callback function which is executed in case of an error. For example:

```js
[ 'try',
  [ SomeComponent ],
  err => {
    console.error( err );
    return [ 'p', 'Unexpected error' ];
  },
]
```

If an error occurs in the component, the callback function is called. It receives the error as an argument, and it should return the template which will be displayed instead.

You can use a [fragment](./templates#fragments) in order to wrap multiple elements inside a `'try'` directive.

The `'try'` directive can handle errors from the following sources:

 - rendering the template (for example when it has invalid syntax)
 - creating a component (for example when the component's function throws an error)
 - conditional or loop directives in the template
 - reactive getters in the template (for example, reactive text values and attributes)
 - event handlers attached to an element in the template
 - asynchronous watchers created by the component

If the error occurs before the component is fully initialized, its `onDestroy()` handlers are not called. When an error occurs in a component which is already mounted, the component is destroyed, the `onDestroy()` handlers are called, and all elements contained in the `'try'` directive are removed from the DOM before rendering the fallback template.

The following example demonstrates how error handling works:

```js
function App() {
  const [ user, setUser ] = state( [ { name: 'John' } ] );

  function handleClick() {
    setUser( null );
  }

  return [ 'try',
    [ 'button', { type: 'button', onclick: handleClick }, user.name ],
    () => [ 'p', 'Unexpected error' ],
  ];
}
```

Initially, a button containing the user's name is displayed. But when the button is clicked, a `TypeError` is thrown, because `user` is set to `null` and its `name` property cannot be read. The `'try'` directive handles this error, removes the button, and displays the "Unexpected error" message.

When an error occurs in a child component, it is propagated up to the nearest `'try'` directive. When an error occurs in the callback function or in the fallback template, it is propagated to the parent `'try'` directive.
