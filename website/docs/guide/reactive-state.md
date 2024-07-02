# Reactive State

## Plain Values

Leaner has a simple, but very flexible mechanism of creating reactive state using the `state()` function:

```js
import { state } from 'leaner';

const [ name, setName ] = state( 'John' );
```

The argument of the `state()` function is the initial value of the state. The state consists of two functions, a getter and a setter, which you can name any way you like using the array destructuring syntax, although the recommended practice is to use the `set` prefix for the setter.

The getter, in this case `name`, is a function which returns the current state:

```js
console.log( name() ); // prints 'John'
```

The setter makes it possible to change the state:

```js
setName( 'Alice' );

console.log( name() ); // prints 'Alice'
```

The setter can also take a function as a parameter. This function can use the previous state to produce the new state, for example:

```js
const [ counter, setCounter ] = state( 0 );

function increment() {
  setCounter( value => value + 1 );
}
```

A state on its own isn't very useful, but it's a powerful feature because it's reactive, which means that you can create code which re-executes whenever the value of the state changes, as described in the following chapters.

When you combine reactive state with declarative HTML templates, you can create complex applications in which the DOM tree is automatically updated whenever the state changes, without having to write any additional code.


## Objects

In addition to plain values (for example, strings, numbers and boolean values), the state can also store complex values, for example an object:

```js
const [ user, setUser ] = state( { name: 'John', age: 35 } );
```

Calling `user()` will return the entire object. You can create a function which returns only a single property of an object:

```js
const userName = () => user().name;
```

However, in Leaner it's possible to use a shorter syntax: `user.name` is also a function which returns the `name` property of the object:

```js
console.log( user.name() ); // prints 'John'
```

At first this may seem unnecessary, because both `user().name` and `user.name()` return the same value. However, functions which return the value of a property are very useful, because they can be passed to HTML templates, as shown in the next chapter.


## Arrays

The state can also be an array:

```js
const [ fruits, setFruits ] = state( [ 'apple', 'orange', 'peach' ] );
```

Calling `fruits()` returns the whole array, and `fruits[ 0 ]` is a function which returns the first element of the array:

```js
console.log( fruits[ 0 ]() ); // prints 'apple'
```

You can also get the length of the array by calling the `fruits.length` function:

```js
console.log( fruits.length() ); // prints 3
```

Objects and arrays can be deeply nested, for example an array can contain objects or nested arrays, and object's properties can also be nested objects or arrays. State is deeply reactive, which means that even deeply nested object properties and array elements can be observed independently.

The [Advanced Reactivity](./advanced-reactivity) chapter describes different ways in which an object or array can be partially updated, without having to replace the entire state.
