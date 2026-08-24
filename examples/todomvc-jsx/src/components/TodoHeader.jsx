export function TodoHeader( { addTodo } ) {
  function onkeyup( e ) {
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
