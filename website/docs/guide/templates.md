---
sidebar: guide
---

# Templates

## Basic Syntax

A Leaner template is just a concise way of describing an HTML element or an entire tree of HTML elements, for example:

```js
[ 'div', { class: 'hello' },
  [ 'h1', 'Hello, world!' ],
  [ 'p', 'This is my first Leaner application.' ],
]
```

Templates consist of regular JavaScript arrays and objects, which means that they don't require any non-standard syntax or special compilers to process them.

Each HTML element is represented by an array which contains the tag, an optional object containing attributes, and zero or more children, which can be text nodes or nested elements.

In the example above, the parent `<div>` element has a `class` attribute and two child elements, `<h1>` and `<p>`. Each of them contains a text node.

The template shown above produces the following HTML:

```html
<div class="hello">
  <h1>Hello, world!</h1>
  <p>This is my first Leaner application.</p>
</div>
```


## Text Nodes

Any string or number which is a child of an HTML element is converted to a text node and appended to that element:

```js
[ 'div', { class: 'user' },
  'John',
  [ 'span', { class: 'age' }, 35 ],
]
```

This template is equivalent to the following HTML:

```html
<div class="user">John<span class="age">35</span></div>
```

You can also use a function which returns a string or number to make the element's text reactive:

```js
const [ user, setUser ] = state( { name: 'John', age: 35 } );

return [ 'div', { class: 'user' },
  user.name,
  [ 'span', { class: 'age' }, user.age ],
];
```

The function can perform some transformations of the state; all its reactive dependencies will be preserved, so the element will still be updated when the state is modified. For example:

```js
const [ user, setUser ] = state( { name: 'John', age: 35 } );

return [ 'div', { class: 'user' },
  () => user.name().toUpperCase(),
  [ 'span', { class: 'age' },
    () => user.age() >= 18 ? 'adult' : 'child',
  ],
];
```

HTML elements can have multiple child text nodes, which is useful for performing text interpolation:

```js
const [ name, setName ] = state( 'John' );

return [ 'p', 'Your name is ', name, '.' ];
```


## Attributes

Each element in the template can contain any number of attributes, for example:

```js
[ 'input', { type: 'text', value: 'John' } ]
```

Instead of a plain value, you can use a function which returns the value of the attribute. If the function is a state getter, or calls a state getter, the attribute is automatically updated whenever the state is modified. For example:

```js
const [ user, setUser ] = state( { name: 'John', age: 35 } );

return [ 'input', { type: 'text', value: user.name } ];
```

As explained in the [previous chapter](./reactive-state#objects), `user.name` is a function which return the `name` property of the user, equivalent to `() => user().name`.

Note that some values are assigned to the element's properties instead of attributes:

 - The `value` and `checked` properties represent the current state of the element.
 - The `textContent` and `innerHTML` properties can be used to directly modify the content of the element.

::: warning
Use the `innerHTML` property with caution, because it can enable XSS attacks if user input is passed to it without sanitization.
:::

When the value of an attribute is set to `null` or `undefined`, it is removed from the element.

When the value of a boolean attribute, for example `disabled` or `readonly`, is set to `true`, it is assigned an empty value, and when set to `false`, it is removed.

The `class` and `style` attributes can use special syntax; see [Classes and Styles](./classes-and-styles) for more information.


## Event Handlers

Event handlers can be passed to an HTML element in the same way as attributes, by prefixing the event name with `on`, for example:

```js
function handleClick() {
  alert( 'The button was clicked!' );
}

return [ 'button', { type: 'button', onclick: handleClick }, 'Click me!' ];
```

An event handler can be used to update the state associated with an interactive element, such as `<input>`:

```js
const [ value, setValue ] = state( '' );

return [ 'input', {
  type: 'text',
  value,
  oninput: e => setValue( e.target.value ),
} ];
```

The `onchange` event can be used for checkboxes, radio buttons and `<select>` elements, for example:

```js
const [ checked, setChecked ] = state( false );

return [ 'input', {
  type: 'checkbox',
  checked,
  onchange: e => setChecked( e.target.checked ),
} ];
```


## References

The special `ref` property can be used to save a reference to the DOM element created by the template:

```js
const [ element, setElement ] = state( null );

return [ 'input', {
  ref: setElement,
  type: 'text',
} ];
```

This is useful if you want to manipulate that element later, for example to focus it in the `onMounted()` handler, as described in the following chapters.


## Fragments

A template can describe multiple consecutive HTML elements; this is called a fragment. To create a fragment, use a nested array:

```js
[[
  [ 'h1', 'Hello, world!' ],
  [ 'p', 'This is my first Leaner application.' ],
]];
```

This template produces the following HTML:

```html
<h1>Hello, world!</h1>
<p>This is my first Leaner application.</p>
```

Fragments are mostly useful in combination with components and loops, as described in the following chapters.
