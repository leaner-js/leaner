import { useComputed } from 'leaner';

export default function TodoFooter( { todos, page, deleteCompleted } ) {
  const remaining = useComputed( () => todos().filter( todo => !todo.completed ).length );

  return [ 'footer', { class: 'footer' },
    [ 'span', { class: 'todo-count' }, [ 'strong', remaining ], [ 'if', () => remaining() == 1, ' item left', ' items left' ] ],
    [ 'ul', { class: 'filters' },
      [ 'li', [ 'a', { class: { selected: () => page() == 'all' }, href: '#/' }, 'All' ] ],
      [ 'li', [ 'a', { class: { selected: () => page() == 'active' }, href: '#/active' }, 'Active' ] ],
      [ 'li', [ 'a', { class: { selected: () => page() == 'completed' }, href: '#/completed' }, 'Completed' ] ],
    ],
    [ 'if', () => todos().some( t => t.completed ),
      [ 'button', { type: 'button', class: 'clear-completed', onclick: deleteCompleted }, 'Clear completed' ],
    ]
  ];
}
