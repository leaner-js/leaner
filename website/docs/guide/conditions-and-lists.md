---
sidebar: guide
---

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

You can create multiple elements based on a single condition:

```js
const [ visible, setVisible ] = state( true );

return [ 'if', visible,
  [ 'p', 'This is rendered conditionally.' ],
  [ 'p', 'And so is this.' ],
];
```

To display different elements when the condition is `false`, you can use the `switch` directive:

```js
const [ visible, setVisible ] = state( true );

return [ 'switch',
  [ 'if', visible, [ 'p', 'This is rendered when condition is true.' ] ],
  [ 'else', [ 'p', 'This is rendered otherwise.' ] ],
];
```

The `'switch'` directive can contain any number of conditions. For example:

```js
const [ first, setFirst ] = state( true );
const [ second, setSecond ] = state( true );

return [ 'switch',
  [ 'if', first, [ 'p', 'The first condition is true.' ] ],
  [ 'if', second, [ 'p', 'The second condition is true.' ] ],
];
```

In that case, only the element matching the first condition which evaluates to `true` is rendered.

You can also combine multiple `'if'` directives and an `'else'` directive in a single `'switch'`:

```js
const [ first, setFirst ] = state( true );
const [ second, setSecond ] = state( true );

return [ 'switch',
  [ 'if', first, [ 'p', 'The first condition is true.' ] ],
  [ 'if', second, [ 'p', 'The second condition is true.' ] ],
  [ 'else', [ 'p', 'None of the conditions is true.' ] ],
];
```

The `'if'` and `'else'` directives nested inside a `'switch'` can also contain multiple child elements:

```js
const [ visible, setVisible ] = state( true );

return [ 'switch',
  [ 'if', visible,
    [ 'p', 'This is rendered conditionally.' ],
    [ 'p', 'And so is this.' ],
  ],
  [ 'else',
    [ 'p', 'This is rendered otherwise.' ],
    [ 'p', 'And also this.' ],
  ],
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
  { name: 'apples', count: 10 },
  { name: 'oranges', count: 20 },
  { name: 'peaches', count: 30 },
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
  <li>apples: 10</li>
  <li>oranges: 20</li>
  <li>peaches: 30</li>
</ul>
```

Whenever the array is modified, the corresponding HTML elements are also automatically updated. When items are inserted or removed from the array, corresponding HTML elements are also created or destroyed.

When the array contains plain values (for example, strings, numbers and boolean values), elements are always created or destroyed at the end, to match the number of items in the array. When you insert or remove items from the middle of the array, existing elements are updated so that they match the content of the array.

On the other hand, when the array contains objects or nested arrays, the elements are keyed to the corresponding items, and are automatically reordered, created and destroyed when the corresponding items are reordered, inserted or removed. Note that this mechanism compares items by reference, so it's not necessary to use an explicit key value.

This mechanism is designed in such way that it just works correctly in most situations without having to take into account any manual optimizations. However, there are a few things to be aware of:

 - The objects and nested arrays must be unique, which means that a single object or nested array cannot be inserted multiple times into the same array of items. On the other hand, plain values don't have to be unique; the array can contain multiple strings or numbers with the same value.

 - The array of items shouldn't mix plain values with objects or nested arrays.

 - When you replace the content of the array which contains objects or nested arrays with new values, all existing HTML elements are destroyed and created again. In some cases that may be the desired behavior, but when you update an array from an API, you may want to merge existing values with new values in order to reduce the number of required DOM operations.

The callback function which creates elements of a loop can receive the index of the item as the second argument:

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

Note that both the `item` and `index` parameters passed to the callback function are reactive, i.e. they are getter functions, not direct values. When the array contains objects or nested arrays, the indexes are updated when the order of items is changed; when the array contains plain values, the items are updated when the array is modified.

The callback function can return a [fragment](./templates#fragments) containing multiple elements:

```js
const [ items, setItems ] = state( [
  { name: 'apple', description: 'a fruit' },
  { name: 'dog', description: 'an animal' },
] );

return [ 'dl',
  [ 'for', items, item => [[
    [ 'dt', item.name ],
    [ 'dd', item.description ],
  ]] ],
];
```

The above template renders the following HTML elements:

```html
<dl>
  <dt>apple</dt>
  <dd>a fruit</dd>
  <dt>dog</dt>
  <dd>an animal</dd>
</dl>
```

The `'for'` directive can contain child [components](./components); their lifecycle hooks are called when the array of items changes and the components are created and destroyed.

It is also possible to repeat a part of the template a specific number of times, without creating an intermediate array. The `'repeat'` directive can be used to do that. Its first argument is the number of copies, and the second argument is a function which returns the child template. For example:

```js
[ 'select', [ 'repeat', 3, index => [ 'option', index ] ] ]
```

This template renders to the following HTML elements:

```html
<select>
  <option>0</option>
  <option>1</option>
  <option>2</option>
</select>
```

A reactive value can also be passed to the `'repeat'` directive instead of a constant number:

```js
const [ count, setCount ] = state( 3 );

return [ 'select',
  [ 'repeat', count, index => [ 'option', index ] ],
];
```

The result is identical, but when the `count` state is modified, options are automatically created or destroyed.

The `'repeat'` directive can also be used to iterate over a fixed array:

```js
const options = [ 'apple', 'orange', 'peach' ];

return [ 'select',
  [ 'repeat', options.length, index => [ 'option', options[ index ] ] ],
];
```

Do not use `'repeat'` to iterate over a reactive array; the `'for'` directive should be used instead, as shown in the examples above.

Note that unlike the `'for'` directive, the `index` parameter passed to the callback function is not reactive, i.e. it's a plain number.

The callback function can return a [fragment](./templates#fragments) containing multiple elements. The `'repeat'` directive can also contain child [components](./components); their lifecycle hooks are called when the number of items changes and components are created and destroyed.



## Dynamic Elements

In some cases a single template can be used to render different HTML elements. Instead of using multiple conditions, you can use the `'dynamic'` directive. It behaves like a regular HTML element, but instead of specifying the HTML tag directly in the template, you can use a function which returns a string representing the HTML tag. For example:

```js
const [ tag, setTag ] = state( 'p' );

return [ 'dynamic', tag, { class: 'dynamic-element' }, 'This tag is dynamic.' ];
```

This example renders a `<p>` element, but when the state changes, a different element will be created instead.

The `'dynamic'` directive can also be used to render different [components](./components). This is useful for example if you want to implement simple routing.

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
