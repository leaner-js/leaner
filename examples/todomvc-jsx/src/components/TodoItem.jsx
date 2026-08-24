import { schedule, state } from 'leaner';

export function TodoItem( { todo, toggleTodo, editTodo, deleteTodo } ) {
  const [ editing, setEditing ] = state( false );
  const [ input, setInput ] = state( null );
  const [ text, setText ] = state( '' );

  function startEdit() {
    setEditing( true );
    setText( todo.title() );
    schedule( () => {
      input().focus();
    } );
  }

  function finishEdit() {
    setEditing( false );
    const trimmed = text().trim();
    if ( trimmed.length > 0 )
      editTodo( todo.id(), trimmed );
    else
      deleteTodo( todo.id() );
  }

  function cancelEdit() {
    setEditing( false );
  }

  function onkeyup( e ) {
    if ( e.key == 'Enter' )
      finishEdit();
    else if ( e.key == 'Escape' )
      cancelEdit();
  }

  return (
    <li class={{ completed: todo.completed, editing }}>
      <div class="view">
        <input class="toggle" type="checkbox" checked={todo.completed} onchange={e => toggleTodo( todo.id(), e.target.checked )}/>
        <label ondblclick={startEdit}>{todo.title}</label>
        <button class="destroy" type="button" onclick={() => deleteTodo( todo.id() )}/>
      </div>
      <if match={editing}>
        <input ref={setInput} type="text" class="edit" value={text} onchange={e => setText( e.target.value )} onkeyup={onkeyup} onblur={cancelEdit}/>
      </if>
    </li>
  );
}
