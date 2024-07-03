---
title: Leaner.js - Thin reactive wrapper for DOM
meta:
  description: Create modern client-side JavaScript applications without compilers or build tools.
---

::: hero
<img src="/logo.svg" alt="">
<h2>Leaner.js</h2>
<p>Thin, reactive wrapper for DOM</p>
<p>Create modern client-side JavaScript applications without compilers or build tools.</p>
<ul>
  <li><a href="/guide/quick-start.html">Get Started<i class="i i-arrow-right"></i></a></li>
  <li><a href="/reference/">API Reference</a></li>
</ul>
:::

## Templates

Do you remember how you could write JavaScript code and run it directly in the browser without having to set up a complex build process? Leaner lets you write applications in pure JavaScript:

```js
function App() {
  return [ 'div', { class: 'hello' },
    [ 'h1', 'Hello, world!' ],
    [ 'p', 'This is my first Leaner application.' ],
  ];
}
```

This simple template syntax makes any compilation unnecessary, either at build-time or at runtime. The Leaner templates are translated directly to DOM elements and attributes, without any virtual DOM or other intermediate steps.


## Reactive State

Leaner has a fine-grained reactivity mechanism in which everything is a function &mdash; not only top-level state values, but also nested properties. For example:

```js
const [ user, setUser ] = state( { name: 'John', age: 35 } );
```

 - `user()` returns the entire user object
 - `user.name()` returns the user's name
 - `user.age()` returns the user's age

You can pass those reactive functions to an HTML template:

```js
[ 'span', { class: 'user-name' }, user.name ];
```

Now the element's text is automatically updated every time the user's name changes.


## Small and Efficient

A simple [TodoMVC](https://todomvc.com/) application created in Leaner is only 15 kilobytes of code (minified, uncompressed). That's over nine times smaller than the equivalent application using React and five times smaller than Vue.

In the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark), Leaner is 20% faster than React and 5% faster than Vue in the DOM manipulation performance tests.

More importantly, in the first paint test, Leaner is about 64% faster than React and 36% faster than Vue. In fact, its first paint performance is similar to some of the fastest frameworks, which rely on complex build-time optimizations, such as Solid and Svelte.
