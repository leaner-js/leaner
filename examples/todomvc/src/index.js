import 'todomvc-app-css/index.css';

import { mount } from 'leaner/web';

import { App } from './components/App.js';

mount( App, document.querySelector( '.todoapp' ) );
