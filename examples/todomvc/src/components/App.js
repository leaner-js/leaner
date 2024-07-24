import { computed, mutate, state } from 'leaner';
import { onMount } from 'leaner/web';

import TodoFooter from './TodoFooter.js';
import TodoHeader from './TodoHeader.js';
import TodoItem from './TodoItem.js';

export function App() {
  let nextId = 1;

  const [ todos, setTodos ] = state( [] );

  const activeTodos = computed( () => todos().filter( t => !t.completed ) );
  const completedTodos = computed( () => todos().filter( t => t.completed ) );

  const [ hash, setHash ] = state( document.location.hash );

  const page = computed( () => hash().split( '/' )[ 1 ] || 'all' );

  const fileredTodos = computed( () => {
    switch ( page() ) {
      case 'active':
        return activeTodos();
      case 'completed':
        return completedTodos();
      default:
        return todos();
    }
  } );

  const allCompleted = computed( () => activeTodos().length == 0 );

  onMount( () => {
    window.addEventListener( 'hashchange', () => setHash( document.location.hash ) );
  } );

  function addTodo( title ) {
    setTodos( mutate( todos => todos.push( { id: nextId++, title, completed: false } ) ) );
  }

  function deleteTodo( id ) {
    setTodos( todos => todos.filter( t => t.id != id ) );
  }

  function toggleTodo( id, completed ) {
    setTodos( mutate( todos => todos.find( t => t.id == id ).completed = completed ) );
  }

  function editTodo( id, title ) {
    setTodos( mutate( todos => todos.find( t => t.id == id ).title = title ) );
  }

  function toggleAll( completed ) {
    setTodos( mutate( todos => todos.forEach( t => t.completed = completed ) ) );
  }

  function deleteCompleted() {
    setTodos( todos => todos.filter( t => !t.completed ) );
  }

  return [[
    [ TodoHeader, { addTodo } ],
    [ 'if', () => todos().length > 0, [[
      [ 'main', { class: 'main' },
        [ 'input', { id: 'toggle-all', class: 'toggle-all', type: 'checkbox', checked: allCompleted, onchange: e => toggleAll( e.target.checked ),
          disabled: () => fileredTodos().length == 0 } ],
        [ 'label', { for: 'toggle-all' }, 'Mark all as complete' ],
        [ 'ul', { class: 'todo-list' },
          [ 'for', fileredTodos, todo => [ TodoItem, { todo, toggleTodo, editTodo, deleteTodo } ] ],
        ],
      ],
      [ TodoFooter, { todos, page, deleteCompleted } ],
    ]] ],
  ]];
}
