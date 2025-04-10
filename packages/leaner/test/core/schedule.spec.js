import { describe, expect, test, vi } from 'vitest';
import { destroyScope, schedule, withScope } from 'leaner';
import { runSchedule } from 'leaner/schedule.js';

describe( 'schedule', () => {
  test( 'called asynchronously', async () => {
    const callback = vi.fn();

    schedule( callback );

    expect( callback ).not.toHaveBeenCalled();

    await Promise.resolve();

    expect( callback ).toHaveBeenCalled();
  } );

  test( 'scheduled from callback', async () => {
    function callbackImplementation() {
      schedule( callback );
    }

    const callback = vi.fn().mockImplementationOnce( callbackImplementation );

    schedule( callback );

    await Promise.resolve();

    expect( callback ).toHaveBeenCalledOnce();

    await Promise.resolve();

    expect( callback ).toHaveBeenCalledTimes( 2 );
  } );

  test( 'called synchronously', () => {
    const callback = vi.fn();

    schedule( callback );

    expect( callback ).not.toHaveBeenCalled();

    runSchedule();

    expect( callback ).toHaveBeenCalled();
  } );

  test( 'not called when scope destroyed', async () => {
    const callback = vi.fn();

    const scope = { watchers: [] };

    withScope( scope, () => {
      schedule( callback );
    } );

    destroyScope( scope );

    await Promise.resolve();

    expect( callback ).not.toHaveBeenCalled();
  } );
} );
