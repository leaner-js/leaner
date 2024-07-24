import { mutate, state } from 'leaner';

const random = ( max ) => Math.round( Math.random() * 1000 ) % max;

const A = [ 'pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean',
  'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
  'cheap', 'expensive', 'fancy' ];
const C = [ 'red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange' ];
const N = [ 'table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse',
  'keyboard'];

let nextId = 1;

const buildData = (count) => {
  const data = new Array( count );

  for ( let i = 0; i < count; i++ ) {
    data[ i ] = {
      id: nextId++,
      label: `${A[ random( A.length ) ]} ${C[ random( C.length ) ]} ${N[ random( N.length ) ]}`,
    };
  }

  return data;
};

function Button( props, children ) {
  return [ 'div', { class: 'col-sm-6 smallpad' },
    [ 'button', { type: 'button', class: 'btn btn-primary btn-block', ...props }, ...children ],
  ];
}

export function App() {
  const [ data, setData ] = state( [] );
  const [ selected, setSelected ] = state( 0 );

  function run() {
    setData( buildData( 1000 ) );
    setSelected( 0 );
  }

  function runLots() {
    setData( buildData( 10000 ) );
    setSelected( 0 );
  }

  function add() {
    setData( data => data.concat( buildData( 1000 ) ) );
  }

  function update() {
    setData( mutate( data => {
      for ( let i = 0; i < data.length; i += 10 )
        data[ i ].label += ' !!!';
    } ) );
  }

  function clear() {
    setData( [] );
    setSelected( 0 );
  }

  function swapRows() {
    setData( mutate( data => {
      if ( data.length > 998 ) {
        const d1 = data[ 1 ];
        const d998 = data[ 998 ];
        data[ 1 ] = d998;
        data[ 998 ] = d1;
      }
    } ) );
  }

  function select( id ) {
    setSelected( id );
  }

  function remove( id ) {
    setData( data => data.filter( item => item.id != id ) );
  }

  return [ 'div', { class: 'container' },
    [ 'div', { class: 'jumbotron' },
      [ 'div', { class: 'row' },
        [ 'div', { class: 'col-md-6' }, [ 'h1', 'Leaner.js' ] ],
        [ 'div', { class: 'col-md-6' },
          [ 'div', { class: 'row' },
            [ Button, { id: 'run', onclick: run }, 'Create 1,000 rows' ],
            [ Button, { id: 'runlots', onclick: runLots }, 'Create 10,000 rows' ],
            [ Button, { id: 'add', onclick: add }, 'Append 1,000 rows' ],
            [ Button, { id: 'update', onclick: update }, 'Update every 10th row' ],
            [ Button, { id: 'clear', onclick: clear }, 'Clear' ],
            [ Button, { id: 'swaprows', onclick: swapRows }, 'Swap Rows' ],
          ],
        ],
      ],
    ],
    [ 'table', { class: 'table table-hover table-striped test-data' },
      [ 'tbody',
        [ 'for', data, item => {
          const id = item.id();
          return [ 'tr', { class: { danger: () => selected() == id } },
            [ 'td', { class: 'col-md-1' }, id ],
            [ 'td', { class: 'col-md-4' }, [ 'a', { onclick: () => select( id ) }, item.label ] ],
            [ 'td', { class: 'col-md-1' }, [ 'a', { onclick: () => remove( id ) },
              [ 'span', { class: 'glyphicon glyphicon-remove', 'aria-hidden': 'true' } ],
            ] ],
            [ 'td', { class: 'col-md-6' } ],
          ];
        } ],
      ],
    ],
    [ 'span', { class: 'preloadicon glyphicon glyphicon-remove', 'aria-hidden': 'true' } ],
  ];
}
