export default function TodoHeader( { addTodo } ) {
  function onkeyup( e ) {
    if ( e.keyCode == 13 ) {
      const trimmed = e.target.value.trim();
      if ( trimmed.length > 0 ) {
        addTodo( trimmed );
        e.target.value = '';
      }
    }
  }

  return [ 'header', { class: 'header' },
    [ 'h1', 'todos' ],
    [ 'input', { class: 'new-todo', placeholder: 'What needs to be done?', autofocus: true, onkeyup } ],
  ];
}
