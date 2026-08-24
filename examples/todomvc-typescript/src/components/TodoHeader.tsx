import type { Leaner } from 'leaner/web';

import type { TodoHeaderProps } from '../types';

export function TodoHeader( { addTodo }: TodoHeaderProps ) {
  function onkeyup( e: Leaner.KeyboardEvent<HTMLInputElement> ) {
    if ( e.key == 'Enter' ) {
      const trimmed = e.currentTarget.value.trim();
      if ( trimmed.length > 0 ) {
        addTodo( trimmed );
        e.currentTarget.value = '';
      }
    }
  }

  return (
    <header class="header">
      <h1>todos</h1>
      <input class="new-todo" placeholder="What needs to be done?" autofocus onkeyup={onkeyup}/>
    </header>
  );
}
