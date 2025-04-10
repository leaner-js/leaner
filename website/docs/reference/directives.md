---
sidebar: reference
---

# Directives

## if

Conditionally creates or destroys child HTML elements or components.

```js
[ 'if', condition, children... ]
...
```

The condition is a reactive function returning a boolean value. The children can be HTML elements, components or fragments. For example:

```js
const [ visible, setVisible ] = state( true );

return [ 'if', visible, [ 'p', 'This is rendered conditionally.' ] ];
```

See [Conditional Rendering](../guide/conditions-and-lists#conditional-rendering) for more information.


## switch

Creates or destroys child HTML elements or components based on multiple conditions.

```js
[ 'switch',
  [ 'if', condition, children... ],
  ...
  [ 'else', children... ],
]
```

The `'switch'` directive can contain multiple `'if'` child directives. Only the first condition which evaluates to `true` is rendered. The `'else'` child directive is optional and is rendered when no conditions evaluate to `true`.

The conditions are reactive functions returning a boolean value. The children can be HTML elements, components or fragments. For example:

```js
const [ visible, setVisible ] = state( true );

return [ 'switch',
  [ 'if', visible, [ 'p', 'This is rendered when condition is true.' ] ],
  [ 'else', [ 'p', 'This is rendered otherwise.' ] ],
];
```

See [Conditional Rendering](../guide/conditions-and-lists#conditional-rendering) for more information.


## for

Creates multiple child HTML elements or components based on a reactive array.

```js
[ 'for', items, ( item, index ) => child ]
```

The first argument is a reactive function returning an array. The second argument is a function which returns the template for the given item.

```js
const [ items, setItems ] = state( [ 'apple', 'orange', 'peach' ] );

return [ 'ul',
  [ 'for', items, item => [ 'li', item ] ],
];
```

See [List Rendering](../guide/conditions-and-lists#list-rendering) for more information.


## repeat

Creates the specified number of child HTML elements or components.

```js
[ 'repeat', count, index => child ]
```

The first argument is a plain number or a reactive function returning a number. The second argument is a function which returns the template for the given item.

```js
const [ count, setCount ] = state( 3 );

return [ 'select',
  [ 'repeat', count, index => [ 'option', index ] ],
];
```

See [List Rendering](../guide/conditions-and-lists#list-rendering) for more information.



## dynamic

Creates a child HTML element or component of a dynamic type.

```js
[ 'dynamic', tagOrComponent, props, children... ]
```

The first arguments is a reactive function returning a string representing the HTML tag or a function representing a component. The following arguments are optional properties and children passed to the element or component. For example:

```js
const [ tag, setTag ] = state( 'p' );

return [ 'dynamic', tag, { class: 'dynamic-element' }, 'This tag is dynamic.' ];
```

See [Dynamic Elements](../guide/conditions-and-lists#dynamic-elements) for more information.


## try

Displays the child template, and replaces it with a fallback template when an error occurs.

```js
[ 'try', child, error => fallbackChild ]
```

The first argument is an element, component or fragment. The second argument is a function which receives the error object and returns the fallback template. For example:

```js
[ 'try',
  [ SomeComponent ],
  err => {
    console.error( err );
    return [ 'p', 'Unexpected error' ];
  },
]
```

See [Error Handling](../guide/error-handling) for more information.
