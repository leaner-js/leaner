import { afterEach } from 'vitest';
import { clearSchedule } from 'leaner/schedule.js';

afterEach( () => {
  clearSchedule();

  if ( typeof document != 'undefined' )
    document.body.innerHTML = '';
} );
