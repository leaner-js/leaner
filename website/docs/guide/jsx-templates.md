---
sidebar: guide
---

# JSX Syntax

One of the biggest advantages of Leaner is that applications can be written in pure JavaScript, and no additional plugins or compilers are necessary. The array-based template syntax is also very concise. However, in larger applications, there are some benefits of using the JSX syntax:

 - IDEs can provide autocompletion and type checking when writing JSX templates, which is not possible when writing plain JavaScript templates.
 - It's easy to copy and paste fragments of HTML directly into your code, without the need to convert them to the array-based syntax.
 - Keeping track of a lot of nested arrays can be difficult. In JSX it's clear where each element starts and ends.

Using the JSX syntax has absolutely no impact at the runtime performance, because it's converted back to plain arrays and objects.

If you are developing a complex application, you are probably already using a bundler such as [Vite](https://vitejs.dev/) or [Rollup](https://rollupjs.org/). The plugin which transforms the JSX syntax to plain JavaScript uses [oxc](https://oxc.rs/), so it's very fast and doesn't have a negative impact on the compilation time.


## Configuring the JSX plugin

To use the JSX plugin for Leaner, install it using npm:

```shell
npm install --save-dev leaner-jsx
```

If you are using Vite, add the plugin to your `vite.config.js` file. For example:

```js
import { defineConfig } from 'vite';
import leanerJsx from 'leaner-jsx';

export default defineConfig( {
  oxc: {
    jsx: 'preserve',
  },
  plugins: [ leanerJsx() ],
} );
```

::: tip NOTE
Make sure to change the `oxc.jsx` option to `'preserve'` so that JSX elements can be processed by the Leaner plugin. Otherwise, Vite will apply React transformations first.

If you are using Vite version 7 or older, use the `esbuild.jsx` option instead.
:::

The plugin is also compatible with Rollup and Rolldown. To enable it, just add it to your `rollup.config.js` or `rolldown.config.js` file. For example:

```js
import { defineConfig } from 'rollup';
import leanerJsx from 'leaner-jsx';

export default defineConfig( {
  input: 'src/index.js',
  output: {
    dir: 'dist',
  },
  plugins: [ leanerJsx() ],
} );
```


## Configuring type checking

To ensure that your IDE can provide autocompletion and type checking when writing JSX templates, add the following options to your `jsconfig.json` file:

```js
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "leaner"
  }
}
```

If you are using TypeScript, add these options to your `tsconfig.json` instead (see [TypeScript Support](./typescript-support) for more information).


## JSX Syntax

Using JSX templates with Leaner is very simple:

```js
import { createApp } from 'leaner/web';

function App() {
  return (
    <div class="hello">
      <h1>Hello, world!</h1>
      <p>This is my first Leaner application.</p>
    </div>
  );
}

createApp( App ).mount( document.body );
```

You can use curly braces to insert dynamic values:

```js
const [ user, setUser ] = state( { name: 'John', age: 35 } );

return (
  <div class="user">
    {user.name}
    <span class="age">{user.age}</span>
  </div>
);
```

::: tip NOTE
Just like in plain JavaScript templates, you should use HTML attributes instead of DOM properties (e.g. `class` instead of `className`), and event handlers should be all-lowercase (e.g. `onclick` instead of `onClick`).
:::

Elements without children should use the self-closing syntax:

```js
<img src="icon.png"/>
```

You can omit the value for boolean attributes:

```js
<input type="text" readonly/>
```

You can use the spread operator for both attributes and children:

```js
<button type="button" {...props}>{...children}</button>
```

Component names should start with uppercase letter to distinguish them from HTML elements and Leaner directives:

```js
<Button class="btn-primary" onclick={submitForm}>OK</Button>
```

The `'if'` directive has the `match` property:

```js
<if match={visible}><p>This is rendered conditionally.</p></if>
```

You can also use the `'switch'` directive in JSX templates:

```js
<switch>
  <if match={first}><p>The first condition is true.</p></if>
  <if match={second}><p>The second condition is true.</p></if>
  <else><p>None of the conditions is true.</p></else>
</switch>
```

The `'for'` directive has the `items` property and a child function expression:

```js
<ul>
  <for items={items}>{item => <li>{item}</li>}</for>
</ul>
```

The `'repeat'` directive has the `count` property and a child function expression:

```js
<select>
  <repeat count={3}>{index => <option>{index}</option>}</repeat>
</select>
```

The `'dynamic'` directive has the `is` property. Other properties are passed to the element or component:

```js
<dynamic is={tag} class="dynamic-element">This tag is dynamic.</dynamic>
```

You can also use the `'try'` and `'catch'` directives in JSX templates:

```js
<try>
  <SomeComponent/>
  <catch>{err => {
    console.error( err );
    return <p>Unexpected error</p>;
  }}</catch>
</try>
```
