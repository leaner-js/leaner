---
sidebar: guide
---

# Quick Start

## Using Leaner from CDN

The easiest way to use Leaner is to load it directly from a CDN which can handle ES6 modules, for example [esm.sh](https://esm.sh/):

```html
<html>
<body>
<script type="module">
import { createApp } from 'https://esm.sh/leaner@0.0.1/web';

function App() {
  return [ 'div', { class: 'hello' },
    [ 'h1', 'Hello, world!' ],
    [ 'p', 'This is my first Leaner application.' ],
  ];
}

createApp( App ).mount( document.body );
</script>
</body>
</html>
```

You can place this code directly in the HTML `<script>` tag or create a separate JavaScript file and load it from the HTML file as a module.

The advantage of this approach is that you don't need to use any build tools, so it's a perfect solution for small and simple applications.


## Using a Bundler

If you want to create more complex application using Leaner, it might be better to use a bundler in order to combine multiple JavaScript files into a single, minified file. This helps to ensure that your website loads faster, at the cost of having to use an extra build step.

To use Leaner with a bundler, simply install it using npm:

```bash
npm install leaner
```

Then you can import functions directly from the `leaner` module:

```js
import { createApp } from 'leaner/web';

function App() {
  return [ 'div', { class: 'hello' },
    [ 'h1', 'Hello, world!' ],
    [ 'p', 'This is my first Leaner application.' ],
  ];
}

createApp( App ).mount( document.body );
```

You can use any modern bundler which supports ES6 modules, for example Rollup or Vite. No additional plugins are necessary. Applications written using Leaner are pure JavaScript code and don't need any special compilers or transpilers.
