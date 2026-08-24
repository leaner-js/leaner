import { computed } from 'leaner';

import type { TodoFooterProps } from '../types';

export function TodoFooter( { todos, page, deleteCompleted }: TodoFooterProps ) {
  const remaining = computed( () => todos().filter( todo => !todo.completed ).length );

  return (
    <footer class="footer">
      <span class="todo-count"><strong>{remaining}</strong>{ () => remaining() == 1 ? ' item left' : ' items left'}</span>
      <ul class="filters">
        <li><a class={{ selected: () => page() == 'all' }} href="#/">All</a></li>
        <li><a class={{ selected: () => page() == 'active' }}  href="#/active">Active</a></li>
        <li><a class={{ selected: () => page() == 'completed' }} href="#/completed">Completed</a></li>
      </ul>
      <if match={() => todos().some( t => t.completed )}>
        <button type="button" class="clear-completed" onclick={deleteCompleted}>Clear completed</button>
      </if>
    </footer>
  );
}
