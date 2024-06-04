import 'todomvc-app-css/index.css';

import { createApp } from 'leaner/web';

import { App } from './components/App.js';

createApp( App ).mount( document.querySelector( '.todoapp' ) );
