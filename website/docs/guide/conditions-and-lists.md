# Condition and Lists

In Leaner, templates are static, which means that once HTML elements are created, they can no longer be modified. In order to dynamically change the HTML elements, for example conditionally create or destroy elements, you can use the built-in directives.


## Conditional Rendering

The `'if'` directive makes it possible to conditionally render HTML elements depending on some conditions. In the simplest forms, it takes a simple condition and child element:

```js
const [ visible, setVisible ] = state( true );

return [ 'if', visible, [ 'p', 'This is rendered conditionally.' ] ];
```

The paragraph is only created when the condition is `true` (or, more precisely, any truthy value). When the condition changes to `false`, the element is destroyed.

Note that the condition must be a function; either a [reactive state](./reactive-state), or a function based on some reactive state, for example:

```js
const [ age, setAge ] = state( 18 );

return [ 'if', () => age() >= 18, [ 'p', 'You are at least 18 years old.' ] ];
```

In order to create multiple elements based on a single condition, you can wrap them in a [fragment](./templates#fragments):

```js
const [ visible, setVisible ] = state( true );

return [ 'if', visible, [[
  [ 'p', 'This is rendered conditionally.' ],
  [ 'p', 'And so is this.' ],
]] ];
```

The `'if'` directive can contain a second child element which is rendered when the condition is `false`:

```js
const [ visible, setVisible ] = state( true );

return [ 'if', visible,
  [ 'p', 'This is rendered when condition is true.' ],
  [ 'p', 'This is rendered otherwise.' ],
];
```

The `'if'` directive can contain any number of conditions. For example:

```js
const [ first, setFirst ] = state( true );
const [ second, setSecond ] = state( true );

return [ 'if',
  first, [ 'p', 'The first condition is true.' ],
  second, [ 'p', 'The second condition is true.' ],
];
```

In that case, only the element matching the first condition which evaluates to `true` is rendered. In addition, it's also possible to specified an element which is rendered when none of the conditions is `true`:

```js
const [ first, setFirst ] = state( true );
const [ second, setSecond ] = state( true );

return [ 'if',
  first, [ 'p', 'The first condition is true.' ],
  second, [ 'p', 'The second condition is true.' ],
  [ 'p', 'None of the conditions is true.' ],
];
```

When the condition contains a child [component](./components) instead of a child element, its lifecycle hooks are called when the condition changes and the component is created and destroyed.


## List Rendering

It is often necessary to render multiple similar elements, for example items of a list or rows of a table. You can use the `'for'` directive to achieve this. Its first argument is a function returning an array, usually a [reactive state](./reactive-state#arrays). The second argument is a function which returns the template for the given item.

```js
const [ items, setItems ] = state( [ 'apple', 'orange', 'peach' ] );

return [ 'ul',
  [ 'for', items, item => [ 'li', item ] ],
];
```

The above template renders the following HTML elements:

```html
<ul>
  <li>apple</li>
  <li>orange</li>
  <li>peach</li>
</ul>
```

Instead of plain values, the array can also contain complex values, for example object or nested arrays:

```js
const [ items, setItems ] = state( [
  { name: 'apple', count: 10 },
  { name: 'orange', count: 20 },
  { name: 'peach', count: 30 },
] );

return [ 'ul',
  [ 'for', items,
    item => [ 'li', [ 'p', item.name, ': ', item.count ] ],
  ],
];
```

The above template renders the following HTML elements:

```html
<ul>
  <li>apple: 10</li>
  <li>orange: 20</li>
  <li>peach: 30</li>
</ul>
```

Whenever the array is modified, the corresponding HTML elements are also automatically updated. When items are inserted or removed from the array, corresponding HTML elements are also created or destroyed.

When the array contains plain values (for example, strings, numbers and boolean values), elements are always created or destroyed at the end, to match the number of items in the array. When you insert or remove items from the middle of the array, existing elements are updated so that they match the content of the array.

On the other hand, when the array contains objects or nested arrays, the elements are keyed to the corresponding items, and are automatically reordered, created and destroyed when the corresponding items are reordered, inserted or removed. Note that this mechanism compares items by reference, so it's not necessary to use an explicit key value.

This mechanism is designed in such way that it just works correctly in most situations without having to take into account any manual optimizations. However, there are a few things to be aware of:

 - The objects and nested arrays must be unique, which means that a single object or nested array cannot be inserted multiple times into the same array of items. On the other hand, plain values don't have to be unique; the array can contain mupliple strings or numbers with the same value.

 - The array of items shouldn't mix plain values with objects or nested arrays.

 - When you replace the content of the array which contains objects or nested arrays with new values, all existing HTML elements are destroyed and created again. In some cases that may be the desired behavior, but when you update an array from an API, you may want to merge existing values with new values in order to reduce the number of required DOM operations.

The function which creates elements of a loop receives the index of the item as the second argument:

```js
const [ items, setItems ] = state( [ 'apple', 'orange', 'peach' ] );

return [ 'ul',
  [ 'for', items, ( item, index ) => [ 'li', index, ': ', item ] ],
];
```

The above template renders the following HTML elements:

```html
<ul>
  <li>0: apple</li>
  <li>1: orange</li>
  <li>2: peach</li>
</ul>
```

The `'for'` directive can contain child [components](./components); their lifecycle hooks are called when the array of items changes and the components are created and destroyed.


## Dynamic Elements

In some cases a single template can be used to render different HTML elements. Instead of using multiple conditions, you can use the `'dynamic'` directive. It behaves like a regular HTML element, but instead of specifying the HTML tag directly in the template, you can use a function which returs a string representing the HTML tag. For example:

```js
const [ tag, setTag ] = state( 'p' );

return [ 'dynamic', tag, { class: 'dynamic-element' }, 'This tag is dynamic.' ];
```

This example renders a `<p>` element, but when the state changes, a different element will be created instead.

The `'dynamic'` directive can also be used to render different [components](./component). This is useful for example if you want to implement simple routing.

```js
const [ page, setPage ] = state( HomePage );

return [ 'dynamic', page ];
```

It is also possible to pass properties and children to a dynamic component.

Note that to set the current component, you have to use the following notation:

```js
setPage( () => AboutPage );
```

Otherwise the component would be interpreted as a setter function and called.

Just like in case of other directives, the lifecycle hooks are called when a component is created or destroyed by the `'dynamic'` directive.
