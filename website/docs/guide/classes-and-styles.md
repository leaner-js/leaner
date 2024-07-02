# Classes and Styles

## Classes

Just like with other attributes, you can use a constant value for the `class` attribute:

```js
[ 'button', { type: 'button', class: 'btn-primary' }, 'OK' ]
```

You can also use a reactive function returning a string value, with all the classes separated by spaces, or an array containing individual classes.

### Object Syntax

When the element has multiple classes, it's easier to use the object syntax, with separate properties for each class. For example:

```js
const { active, setActive } = state( false );
const { large, setLarge } = state( false );

return [ 'button', {
  type: 'button',
  class: { 'is-active': active, 'is-large': large },
}, 'OK' ];
```

The `is-active` and `is-large` classes are automatically added or removed from the button when the corresponding state is modified.

### Array Syntax

If the element has both constant and variable classes, you can also use the array syntax:

```js
const { active, setActive } = state( false );
const { large, setLarge } = state( false );

return [ 'button', {
  type: 'button',
  class: [ 'btn-primary', { 'is-active': active, 'is-large': large } ],
}, 'OK' ];
```

The button now always has the `btn-primary` class, and the `is-active` and `is-large` classes are toggled by the corresponding states.

The array of classes can also contain functions which return strings, for example:

```js
const { type, setType } = state( 'primary' );
const { active, setActive } = state( false );

return [ 'button', {
  type: 'button',
  class: [
    () => 'btn-' + type(),
    () => active() ? 'is-active' : null,
  ],
}, 'OK' ];
```


## Inline Styles

The `style` attribute can be a string:

```js
[ 'div', { style: 'display: none;' }, 'This element is invisible' ]
```

An object syntax can also be used:

```js
[ 'div', { style: { display: 'none' } }, 'This element is invisible' ]
```

Note that dashed CSS properties become camel-cased, for example the `font-size` style becomes the `fontSize` property.

Inline styles can also be reactive. The value of the style attribute can be a function returning a string or an object. It can also be an object with reactive properties:

```js
const [ color, setColor ] = state( 'red' );
const [ fontSize, setFontSize ] = state( 30 );

return [ 'div', { style: {
  color,
  fontSize: () => fontSize + 'px',
} } ];
```

It's also possible to assign custom CSS properties to an element:

```js
const [ color, setColor ] = state( 'red' );
const [ fontSize, setFontSize ] = state( 30 );

return [ 'div', { style: {
  '--custom-color': color,
  '--custom-font-size': () => fontSize + 'px',
} } ];
```
