function connect() {
  let reloading = false;

  const { hostname, port } = window.location;

  const source = new EventSource( `http://${hostname}:${port}/__sync__` );

  source.addEventListener( 'open', () => console.info( 'Development server connected.' ) );

  source.addEventListener( 'error', error => {
    if ( reloading )
      return;
    if ( source.readyState == EventSource.CONNECTING || source.readyState == EventSource.CLOSED ) {
      console.info( 'Lost connection to development server. Trying to reconnect...' );
      if ( source.readyState == EventSource.CLOSED ) {
        source.close();
        setTimeout( connect, 10000 );
      }
    } else {
      console.error( error );
    }
  } );

  source.addEventListener( 'reload', event => {
    console.info( 'Reloading...' );
    window.location.reload();
    reloading = true;
  } );
}

connect();
